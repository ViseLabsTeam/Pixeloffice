import './board.css';
import { type ScreenShare } from '../media/screen-share';
import { DrawingSurface, type DrawingTool } from './drawing-surface';

function element<T extends HTMLElement>(id:string):T{
  const node=document.getElementById(id);if(!node)throw new Error(`Elemento de pizarrón ausente: ${id}`);return node as T;
}
type Tab='draw'|'screen';
interface BoardCallbacks{blocked:(blocked:boolean)=>void;changed:(dirty:boolean)=>void;}

export class BoardPanel {
  private readonly controller=new AbortController();
  private readonly dialog=element<HTMLDialogElement>('board-dialog');
  private readonly video=element<HTMLVideoElement>('screen-preview');
  private readonly drawing:DrawingSurface;
  private tab:Tab='draw';
  private previousFocus:HTMLElement|undefined;
  private destroyed=false;
  private readonly downloads=new Map<string,number>();

  constructor(private readonly screen:ScreenShare,private readonly callbacks:BoardCallbacks){
    const options={signal:this.controller.signal};
    const click=(id:string,fn:()=>void)=>element(id).addEventListener('click',fn,options);
    this.drawing=new DrawingSurface(element<HTMLCanvasElement>('board-canvas'),()=>{
      this.renderDrawing();this.callbacks.changed(this.drawing.dirty);
    });
    click('board-close',()=>this.close());
    this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();},options);
    for(const tab of ['draw','screen'] as const){
      const button=element(`board-tab-${tab}`);
      button.addEventListener('click',()=>this.selectTab(tab),options);
      button.addEventListener('keydown',event=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
        event.preventDefault();const next=event.key==='Home'?'draw':event.key==='End'?'screen':tab==='draw'?'screen':'draw';
        this.selectTab(next);element(`board-tab-${next}`).focus();
      },options);
    }
    for(const button of this.dialog.querySelectorAll<HTMLButtonElement>('[data-drawing-tool]')){
      button.addEventListener('click',()=>{this.drawing.finishStroke();this.drawing.tool=button.dataset.drawingTool as DrawingTool;this.renderDrawing();},options);
    }
    const color=element<HTMLInputElement>('board-color');
    color.addEventListener('input',()=>{this.drawing.color=color.value;this.renderDrawing();},options);
    for(const button of this.dialog.querySelectorAll<HTMLButtonElement>('[data-drawing-color]')){
      button.addEventListener('click',()=>{color.value=button.dataset.drawingColor!;this.drawing.color=color.value;this.renderDrawing();},options);
    }
    const size=element<HTMLInputElement>('board-size');
    size.addEventListener('input',()=>{
      this.drawing.size=Number(size.value);element<HTMLOutputElement>('board-size-value').value=`${size.value} px`;
    },options);
    element<HTMLInputElement>('board-fill').addEventListener('change',event=>{this.drawing.filled=(event.target as HTMLInputElement).checked;},options);
    click('board-undo',()=>this.drawing.undo());click('board-redo',()=>this.drawing.redo());click('board-clear',()=>this.drawing.clear());
    click('board-download',()=>{void this.download();});
    click('screen-toggle',()=>{
      if(screen.active||screen.pending)screen.stop();
      else void screen.start(element<HTMLInputElement>('screen-audio').checked);
    });
    click('board-stop-presentation',()=>screen.stop());
    screen.addEventListener('change',()=>this.renderScreen(),options);
    this.dialog.addEventListener('keydown',event=>{
      if(this.tab!=='draw'||event.altKey||event.target instanceof Element&&event.target.closest('input,textarea,select'))return;
      const key=event.key.toLowerCase();
      if(event.ctrlKey||event.metaKey){
        if(key==='z'){event.preventDefault();if(event.shiftKey)this.drawing.redo();else this.drawing.undo();}
        else if(key==='y'){event.preventDefault();this.drawing.redo();}
        return;
      }
      const tool:DrawingTool|undefined=({b:'pen',e:'eraser',l:'line',r:'rectangle',o:'ellipse'} as const)[key as 'b'|'e'|'l'|'r'|'o'];
      if(tool){event.preventDefault();this.drawing.finishStroke();this.drawing.tool=tool;this.renderDrawing();}
    },options);
    this.renderDrawing();this.renderScreen();
  }
  get isOpen(){return this.dialog.open;}
  get dirty(){return this.drawing.dirty;}
  open(tab:Tab='draw'){
    if(this.destroyed)return;
    if(!this.isOpen){this.previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:undefined;this.callbacks.blocked(true);this.dialog.showModal();}
    this.selectTab(tab);this.dialog.scrollTop=0;element(`board-tab-${tab}`).focus();
  }
  private selectTab(tab:Tab){
    this.drawing.finishStroke();this.tab=tab;
    for(const name of ['draw','screen'] as const){
      const active=name===tab;const button=element(`board-tab-${name}`);
      button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;element(`board-panel-${name}`).hidden=!active;
    }
    this.renderScreen();
  }
  close(){
    this.drawing.finishStroke();
    if(this.screen.active||this.screen.pending)this.screen.stop();
    this.video.pause();this.video.srcObject=null;
    if(!this.isOpen)return;
    this.dialog.close();this.callbacks.blocked(false);
    if(!this.destroyed){
      const focus=this.previousFocus?.isConnected?this.previousFocus:element('world');focus.focus({preventScroll:true});
    }
  }
  private renderDrawing(){
    for(const button of this.dialog.querySelectorAll<HTMLButtonElement>('[data-drawing-tool]'))button.setAttribute('aria-pressed',String(button.dataset.drawingTool===this.drawing.tool));
    for(const button of this.dialog.querySelectorAll<HTMLButtonElement>('[data-drawing-color]'))button.setAttribute('aria-pressed',String(button.dataset.drawingColor===this.drawing.color));
    element<HTMLButtonElement>('board-undo').disabled=!this.drawing.canUndo;
    element<HTMLButtonElement>('board-redo').disabled=!this.drawing.canRedo;
    element<HTMLButtonElement>('board-clear').disabled=!this.drawing.dirty;
    element<HTMLInputElement>('board-fill').disabled=!['rectangle','ellipse'].includes(this.drawing.tool);
    element('board-canvas').dataset.tool=this.drawing.tool;
    element('board-document-state').textContent=this.drawing.dirty?'Con dibujos':'Lienzo limpio';
  }
  private renderScreen(){
    const active=this.screen.active,pending=this.screen.pending;
    const button=element<HTMLButtonElement>('screen-toggle');
    button.disabled=!this.screen.supported||this.destroyed;
    button.textContent=active?'Dejar de presentar':pending?'Cancelar solicitud':'Presentar pantalla';button.setAttribute('aria-pressed',String(active));
    element<HTMLInputElement>('screen-audio').disabled=active||pending;
    element('board-stop-presentation').hidden=!active&&!pending;
    element('board-stop-presentation').textContent=active?'Detener presentación':'Cancelar presentación';
    element('screen-status').textContent=this.screen.supported?this.screen.message:'La captura no está disponible aquí. Abrí la oficina en HTTPS o localhost con un navegador de escritorio compatible.';
    element('screen-status').dataset.error=String(this.screen.error||!this.screen.supported);
    element('screen-source').textContent=active?`${this.screen.label} · ${this.screen.hasAudio?'Con audio de la fuente':'Sin audio de la fuente'}`:'Sin presentación activa';
    element('screen-placeholder').hidden=active;this.video.hidden=!active;
    const stream=this.isOpen&&this.tab==='screen'&&active?this.screen.stream:null;
    if(this.video.srcObject!==stream){
      this.video.pause();this.video.srcObject=stream??null;
      if(stream)void this.video.play().catch(()=>{
        if(this.video.srcObject===stream)element('screen-status').textContent='La captura está activa, pero la vista previa no pudo reproducirse. Cerrá y volvé a presentar.';
      });
    }
  }
  private async download(){
    const button=element<HTMLButtonElement>('board-download');button.disabled=true;
    try{
      const blob=await this.drawing.png();if(this.destroyed)return;
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='pixel-office-pizarron.png';
      document.body.append(link);link.click();link.remove();
      const timer=window.setTimeout(()=>{URL.revokeObjectURL(url);this.downloads.delete(url);},1000);this.downloads.set(url,timer);
      element('board-message').textContent='PNG preparado para descargar.';
    }catch(error){element('board-message').textContent=error instanceof Error?error.message:'No se pudo descargar el dibujo.';}
    finally{if(!this.destroyed)button.disabled=false;}
  }
  reset(){this.close();this.drawing.reset();element('board-message').textContent='';}
  destroy(){
    this.destroyed=true;this.controller.abort();this.close();this.drawing.destroy();
    for(const [url,timer] of this.downloads){clearTimeout(timer);URL.revokeObjectURL(url);}this.downloads.clear();
  }
}
