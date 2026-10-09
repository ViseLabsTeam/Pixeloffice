import './menu.css';
import { type AudioMixer } from '../media/audio-mixer';
import { type LocalMedia } from '../media/local-media';
import { cleanName, loadPreferences, savePreferences } from './preferences';

function element<T extends HTMLElement>(id:string):T {
  const node=document.getElementById(id);
  if(!node)throw new Error(`Elemento del menú ausente: ${id}`);
  return node as T;
}
type Tab='profile'|'audio'|'camera'|'screen'|'music';
interface MenuCallbacks {
  nameChanged:(name:string)=>void;
  blocked:(blocked:boolean)=>void;
  leave:()=>void;
  present:()=>void;
}

export class OfficeMenu {
  private readonly controller=new AbortController();
  private readonly dialog=element<HTMLDialogElement>('office-menu');
  private readonly preferences=loadPreferences();
  private tab:Tab='profile';
  private settings=false;
  private ready=false;
  private meterTimer=0;
  entered=false;

  constructor(private readonly audio:AudioMixer,private readonly media:LocalMedia,private readonly callbacks:MenuCallbacks){
    const options={signal:this.controller.signal};
    const click=(id:string,callback:()=>void)=>element(id).addEventListener('click',callback,options);
    element('entry-form').addEventListener('submit',event=>{
      event.preventDefault();
      if(!this.ready)return;
      const name=this.validateName('entry-name','entry-error');
      if(!name)return;
      this.saveName(name);this.entered=true;
      element('open-settings').hidden=false;this.close();
    },options);
    element('profile-form').addEventListener('submit',event=>{
      event.preventDefault();const name=this.validateName('profile-name','profile-message');
      if(!name)return;
      this.saveName(name);const message=element('profile-message');
      message.dataset.success='true';message.textContent='Nombre actualizado.';
    },options);
    for(const id of ['entry-name','profile-name'])element(id).addEventListener('input',()=>{
      element(id).removeAttribute('aria-invalid');
      element(id==='entry-name'?'entry-error':'profile-message').textContent='';
    },options);
    click('welcome-settings',()=>this.openSettings());
    click('open-settings',()=>this.openSettings());
    click('open-presentation',()=>this.callbacks.present());
    click('close-settings',()=>this.back());click('done-settings',()=>this.back());
    click('leave-office',()=>{
      this.media.stopAll();this.audio.stopMusic();this.entered=false;
      element('open-settings').hidden=true;this.showWelcome();this.callbacks.leave();
    });
    this.dialog.addEventListener('cancel',event=>{event.preventDefault();if(this.settings)this.back();},options);
    const tabs=[...this.dialog.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    for(const [index,button] of tabs.entries()){
      button.addEventListener('click',()=>this.selectTab(button.dataset.tab as Tab),options);
      button.addEventListener('keydown',event=>{
        let next=index;
        if(event.key==='ArrowRight')next=(index+1)%tabs.length;
        else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
        else if(event.key==='Home')next=0;
        else if(event.key==='End')next=tabs.length-1;
        else return;
        event.preventDefault();this.selectTab(tabs[next]!.dataset.tab as Tab);tabs[next]!.focus();
      },options);
    }
    const ranges=[
      ['microphone-volume','microphoneVolume',(value:number)=>audio.setMicrophoneVolume(value)],
      ['voices-volume','voicesVolume',(value:number)=>audio.setVoicesVolume(value)],
      ['music-volume','musicVolume',(value:number)=>audio.setMusicVolume(value)]
    ] as const;
    for(const [id,key,apply] of ranges){
      const range=element<HTMLInputElement>(id);range.value=String(this.preferences[key]);
      const update=()=>{
        const value=Number(range.value);apply(value);this.preferences[key]=value;
        element<HTMLOutputElement>(`${id}-value`).value=`${value} %`;
        range.setAttribute('aria-valuetext',`${value} por ciento`);
      };
      update();range.addEventListener('input',()=>{update();savePreferences(this.preferences);},options);
    }
    const loop=element<HTMLInputElement>('music-loop');loop.checked=this.preferences.musicLoop;audio.setMusicLoop(loop.checked);
    loop.addEventListener('change',()=>{audio.setMusicLoop(loop.checked);this.preferences.musicLoop=loop.checked;savePreferences(this.preferences);},options);
    click('music-play',()=>{if(audio.musicPlaying)audio.pauseMusic();else void audio.playMusic();});
    click('music-stop',()=>audio.stopMusic());click('music-ambient',()=>audio.useAmbient());
    const file=element<HTMLInputElement>('music-file');
    click('music-file-button',()=>file.click());
    file.addEventListener('change',()=>{
      const selected=file.files?.[0];if(!selected)return;
      try{audio.loadFile(selected);}catch(error){element('music-error').textContent=error instanceof Error?error.message:'No se pudo abrir el archivo.';}
      file.value='';
    },options);
    audio.addEventListener('change',()=>this.renderAudio(),options);
    document.addEventListener('visibilitychange',()=>this.updateMeter(),options);
    this.saveName(this.preferences.displayName);this.renderAudio();
  }
  get isOpen(){return this.dialog.open;}
  start(){this.showWelcome();}
  setReady(ready:boolean){
    this.ready=ready;
    element<HTMLButtonElement>('enter-office').disabled=!ready;
    element('enter-office').textContent=ready?'Entrar a la oficina →':'Preparando oficina…';
    element('entry-status').textContent=ready?'Todo listo. Entrá a tu ritmo.':'Cargando el escenario…';
  }
  setError(message:string){element('entry-status').textContent=message;}
  private validateName(inputId:string,messageId:string){
    const input=element<HTMLInputElement>(inputId),name=cleanName(input.value),message=element(messageId);
    message.dataset.success='false';
    if(name.length<2){message.textContent='Escribí un nombre de entre 2 y 24 caracteres.';input.setAttribute('aria-invalid','true');input.focus();return '';}
    input.removeAttribute('aria-invalid');message.textContent='';return name;
  }
  private saveName(name:string){
    this.preferences.displayName=name;savePreferences(this.preferences);
    element<HTMLInputElement>('entry-name').value=name;element<HTMLInputElement>('profile-name').value=name;
    element('profile-display').textContent=name||'Tu nombre';this.callbacks.nameChanged(name);
  }
  private show(){
    this.callbacks.blocked(true);
    if(!this.dialog.open)this.dialog.showModal();
    this.dialog.scrollTop=0;this.updateMeter();
  }
  private showWelcome(){
    this.settings=false;element('welcome-view').hidden=false;element('settings-view').hidden=true;
    this.dialog.setAttribute('aria-labelledby','menu-title');this.show();element('entry-name').focus();
  }
  openSettings(){
    this.settings=true;element('welcome-view').hidden=true;element('settings-view').hidden=false;
    element('leave-office').hidden=!this.entered;
    if(!this.entered)element<HTMLInputElement>('profile-name').value=element<HTMLInputElement>('entry-name').value;
    this.dialog.setAttribute('aria-labelledby','settings-title');this.show();this.selectTab(this.tab);
    element(`tab-${this.tab}`).focus();
  }
  private selectTab(tab:Tab){
    this.tab=tab;
    for(const name of ['profile','audio','camera','screen','music'] as const){
      const active=name===tab;const button=element(`tab-${name}`);
      button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
      element(`panel-${name}`).hidden=!active;
    }
    this.updateMeter();
  }
  private back(){if(this.entered)this.close();else this.showWelcome();}
  private close(){
    this.dialog.close();this.callbacks.blocked(false);this.updateMeter();element('world').focus({preventScroll:true});
  }
  private renderAudio(){
    element('music-title').textContent=this.audio.musicTitle;
    element('music-state').textContent=`${this.audio.musicKind==='ambient'?'Ambiente 8 bit':'Archivo local'} · ${this.audio.musicPlaying?'Reproduciendo':'En pausa'}`;
    element('music-play').textContent=this.audio.musicPlaying?'Pausar':'Reproducir';
    element('music-play').setAttribute('aria-pressed',String(this.audio.musicPlaying));
    element('music-bars').dataset.playing=String(this.audio.musicPlaying);
    element('music-error').textContent=this.audio.musicError;
    element('voices-status').textContent=this.audio.participantCount?`${this.audio.participantCount} voces conectadas.`:'Aún no hay otras voces conectadas.';
    this.updateMeter();
  }
  private updateMeter(){
    clearInterval(this.meterTimer);this.meterTimer=0;
    const draw=()=>{
      element<HTMLMeterElement>('microphone-level').value=this.audio.microphoneLevel();
      element('microphone-level-label').textContent=this.audio.microphoneConnected?'Escuchando':'Apagado';
    };
    draw();
    if(this.isOpen&&this.settings&&this.tab==='audio'&&this.audio.microphoneConnected&&!document.hidden)this.meterTimer=window.setInterval(draw,100);
  }
  destroy(){this.controller.abort();clearInterval(this.meterTimer);this.dialog.close();}
}
