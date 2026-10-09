/** Local display capture; the session transport can publish stream in a later stage. */
export class ScreenShare extends EventTarget {
  private capture:MediaStream|undefined;
  private request=0;
  private destroyed=false;
  pending=false;
  message='Elegí una pestaña, ventana o pantalla para presentar.';
  error=false;

  get supported(){return Boolean(navigator.mediaDevices?.getDisplayMedia);}
  get stream(){return this.capture;}
  get active(){return this.capture?.getVideoTracks().some(track=>track.readyState==='live')??false;}
  get label(){return this.capture?.getVideoTracks()[0]?.label||'Tu pantalla';}
  get hasAudio(){return this.capture?.getAudioTracks().some(track=>track.readyState==='live')??false;}
  private changed(){this.dispatchEvent(new Event('change'));}

  async start(includeAudio:boolean){
    if(this.destroyed||this.active||this.pending)return;
    if(!this.supported){
      this.message='Este navegador no permite capturar pantalla. Probá desde un navegador de escritorio en HTTPS o localhost.';
      this.error=true;this.changed();return;
    }
    const request=++this.request;
    this.pending=true;this.error=false;this.message='Elegí qué presentar en el selector del navegador.';this.changed();
    try{
      // Keep this call in the initiating user gesture, without awaiting anything first.
      const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:15,max:30}},audio:includeAudio});
      if(this.destroyed||request!==this.request){stream.getTracks().forEach(track=>track.stop());return;}
      const video=stream.getVideoTracks()[0];
      if(!video||video.readyState!=='live'){
        stream.getTracks().forEach(track=>track.stop());throw new Error('No hay una pantalla disponible.');
      }
      this.capture=stream;
      video.addEventListener('ended',()=>{if(this.capture===stream)this.stop('La presentación finalizó desde el navegador.');},{once:true});
      for(const track of stream.getAudioTracks())track.addEventListener('ended',()=>{if(this.capture===stream)this.changed();},{once:true});
      this.message='Presentación activa. Al cerrar el pizarrón se detiene la captura.';
    }catch(error){
      if(request!==this.request||this.destroyed)return;
      const name=error instanceof DOMException?error.name:'';
      this.message=name==='NotAllowedError'||name==='AbortError'
        ?'No se inició la presentación: se canceló la selección o no se concedió permiso. Podés volver a intentarlo.'
        :name==='NotReadableError'
          ?'No se pudo capturar esa ventana. Probá con otra fuente o revisá los permisos del sistema.'
          :'No se pudo iniciar la presentación. Volvé a intentarlo desde HTTPS o localhost en un navegador compatible.';
      this.error=true;
    }finally{
      if(request===this.request){this.pending=false;if(!this.destroyed)this.changed();}
    }
  }
  stop(message='Presentación detenida.'){
    ++this.request;this.pending=false;
    const stream=this.capture;this.capture=undefined;
    stream?.getTracks().forEach(track=>track.stop());
    this.message=message;this.error=false;this.changed();
  }
  destroy(){this.destroyed=true;this.stop();}
}
