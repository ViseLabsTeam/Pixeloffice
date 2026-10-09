export type DrawingTool='pen'|'eraser'|'line'|'rectangle'|'ellipse';
type Point={x:number;y:number};
type Stroke={pointer:number;before:ImageData;start:Point;last:Point;tool:DrawingTool;color:string;size:number;filled:boolean};
const HISTORY_LIMIT=8;

/** A fixed logical bitmap: CSS resizing never clears or resamples the document. */
export class DrawingSurface {
  private readonly context:CanvasRenderingContext2D;
  private readonly controller=new AbortController();
  private readonly undoStack:ImageData[]=[];
  private readonly redoStack:ImageData[]=[];
  private stroke:Stroke|undefined;
  tool:DrawingTool='pen';
  color='#263645';
  size=6;
  filled=false;
  dirty=false;

  constructor(readonly canvas:HTMLCanvasElement,private readonly onChange:()=>void){
    canvas.width=960;canvas.height=540;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    if(!context)throw new Error('El navegador no pudo abrir el lienzo.');
    this.context=context;
    const options={signal:this.controller.signal};
    canvas.addEventListener('pointerdown',event=>{
      if(this.stroke||event.button!==0||!event.isPrimary)return;
      event.preventDefault();canvas.focus({preventScroll:true});
      const point=this.point(event);
      this.stroke={pointer:event.pointerId,before:this.snapshot(),start:point,last:point,tool:this.tool,color:this.color,size:this.size,filled:this.filled};
      canvas.setPointerCapture(event.pointerId);this.draw(point);
    },options);
    canvas.addEventListener('pointermove',event=>{
      if(event.pointerId!==this.stroke?.pointer)return;
      const samples=event.getCoalescedEvents?.()||[];
      for(const sample of samples.length?samples:[event])this.draw(this.point(sample));
    },options);
    canvas.addEventListener('pointerup',event=>{
      if(event.pointerId!==this.stroke?.pointer)return;
      this.draw(this.point(event));this.finishStroke();
    },options);
    canvas.addEventListener('pointercancel',event=>{if(event.pointerId===this.stroke?.pointer)this.finishStroke(false);},options);
    canvas.addEventListener('lostpointercapture',event=>{if(event.pointerId===this.stroke?.pointer)this.finishStroke(false);},options);
    window.addEventListener('blur',()=>this.finishStroke(),options);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.finishStroke();},options);
  }
  get canUndo(){return this.undoStack.length>0;}
  get canRedo(){return this.redoStack.length>0;}
  private point(event:PointerEvent):Point{
    const rect=this.canvas.getBoundingClientRect();
    return {x:Math.max(0,Math.min(this.canvas.width,(event.clientX-rect.left)*this.canvas.width/rect.width)),
      y:Math.max(0,Math.min(this.canvas.height,(event.clientY-rect.top)*this.canvas.height/rect.height))};
  }
  private snapshot(){return this.context.getImageData(0,0,this.canvas.width,this.canvas.height);}
  private draw(point:Point){
    const stroke=this.stroke;if(!stroke)return;
    const ctx=this.context,shape=stroke.tool!=='pen'&&stroke.tool!=='eraser';
    if(shape)ctx.putImageData(stroke.before,0,0);
    ctx.save();ctx.globalCompositeOperation=stroke.tool==='eraser'?'destination-out':'source-over';
    ctx.strokeStyle=stroke.color;ctx.fillStyle=stroke.color;ctx.lineWidth=stroke.size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    if(stroke.tool==='rectangle'){
      ctx.rect(stroke.start.x,stroke.start.y,point.x-stroke.start.x,point.y-stroke.start.y);
      if(stroke.filled)ctx.fill();else ctx.stroke();
    }else if(stroke.tool==='ellipse'){
      ctx.ellipse((stroke.start.x+point.x)/2,(stroke.start.y+point.y)/2,Math.abs(point.x-stroke.start.x)/2,Math.abs(point.y-stroke.start.y)/2,0,0,Math.PI*2);
      if(stroke.filled)ctx.fill();else ctx.stroke();
    }else{
      const start=shape?stroke.start:stroke.last;
      if(start.x===point.x&&start.y===point.y){ctx.arc(point.x,point.y,stroke.size/2,0,Math.PI*2);ctx.fill();}
      else{ctx.moveTo(start.x,start.y);ctx.lineTo(point.x,point.y);ctx.stroke();}
    }
    ctx.restore();stroke.last=point;
  }
  private pushUndo(before:ImageData){
    this.undoStack.push(before);if(this.undoStack.length>HISTORY_LIMIT)this.undoStack.shift();this.redoStack.length=0;
  }
  private changed(pixels=this.snapshot()){
    this.dirty=false;
    for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i]){this.dirty=true;break;}
    this.canvas.dataset.dirty=String(this.dirty);this.onChange();
  }
  finishStroke(commit=true){
    const stroke=this.stroke;if(!stroke)return;
    this.stroke=undefined;
    if(this.canvas.hasPointerCapture(stroke.pointer))this.canvas.releasePointerCapture(stroke.pointer);
    if(!commit){this.context.putImageData(stroke.before,0,0);return;}
    const after=this.snapshot();
    if(after.data.some((value,index)=>value!==stroke.before.data[index]))this.pushUndo(stroke.before);
    this.changed(after);
  }
  undo(){
    this.finishStroke();const previous=this.undoStack.pop();if(!previous)return;
    this.redoStack.push(this.snapshot());this.context.putImageData(previous,0,0);this.changed(previous);
  }
  redo(){
    this.finishStroke();const next=this.redoStack.pop();if(!next)return;
    this.undoStack.push(this.snapshot());this.context.putImageData(next,0,0);this.changed(next);
  }
  clear(){
    this.finishStroke();if(!this.dirty)return;
    this.pushUndo(this.snapshot());this.context.clearRect(0,0,this.canvas.width,this.canvas.height);this.changed();
  }
  reset(){
    this.finishStroke(false);this.undoStack.length=0;this.redoStack.length=0;
    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);this.changed();
  }
  png():Promise<Blob>{
    this.finishStroke();
    const output=document.createElement('canvas');output.width=this.canvas.width;output.height=this.canvas.height;
    const ctx=output.getContext('2d');
    if(!ctx)return Promise.reject(new Error('No se pudo preparar el archivo.'));
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,output.width,output.height);ctx.drawImage(this.canvas,0,0);
    return new Promise((resolve,reject)=>output.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo generar el PNG.')),'image/png'));
  }
  destroy(){this.controller.abort();this.finishStroke(false);this.undoStack.length=0;this.redoStack.length=0;}
}
