const clamp=(value:number,max=100)=>Math.max(0,Math.min(max,Number.isFinite(value)?value:0));

export class AudioMixer extends EventTarget {
  private context:AudioContext|undefined;
  private micGain:GainNode|undefined;
  private micSource:MediaStreamAudioSourceNode|undefined;
  private micDestination:MediaStreamAudioDestinationNode|undefined;
  private meter:AnalyserNode|undefined;
  private meterValues:Uint8Array<ArrayBuffer>|undefined;
  private voicesGain:GainNode|undefined;
  private musicGain:GainNode|undefined;
  private readonly voices=new Map<string,MediaStreamAudioSourceNode>();
  private ambient:AudioBuffer|undefined;
  private ambientSource:AudioBufferSourceNode|undefined;
  private ambientStarted=0;
  private ambientOffset=0;
  private fileSource:MediaElementAudioSourceNode|undefined;
  private readonly fileAudio=new Audio();
  private fileUrl:string|undefined;
  private fileName='';
  private playRequest=0;
  private destroyed=false;
  microphoneVolume=100;
  voicesVolume=80;
  musicVolume=35;
  musicLoop=true;
  musicKind:'ambient'|'file'='ambient';
  musicPlaying=false;
  musicError='';

  constructor(){
    super();
    this.fileAudio.preload='metadata';
    this.fileAudio.onended=()=>{if(this.musicKind==='file'){this.musicPlaying=false;this.changed();}};
    this.fileAudio.onerror=()=>{if(this.musicKind!=='file')return;this.musicPlaying=false;this.musicError='No se pudo reproducir este archivo. Probá con MP3, WAV u OGG.';this.changed();};
  }
  private changed(){this.dispatchEvent(new Event('change'));}
  get musicTitle(){return this.musicKind==='ambient'?'Tarde de píxeles':this.fileName;}
  get hasMusicFile(){return Boolean(this.fileUrl);}
  get participantCount(){return this.voices.size;}
  get microphoneStream(){return this.micDestination?.stream;}
  get microphoneConnected(){return Boolean(this.micSource);}

  async enable(){
    if(this.destroyed)throw new Error('Audio cerrado');
    if(!this.context){
      this.context=new AudioContext();
      this.voicesGain=this.context.createGain();this.voicesGain.gain.value=this.voicesVolume/100;
      this.musicGain=this.context.createGain();this.musicGain.gain.value=this.musicVolume/100;
      this.voicesGain.connect(this.context.destination);this.musicGain.connect(this.context.destination);
    }
    if(this.context.state==='suspended')await this.context.resume();
    if(this.destroyed)throw new Error('Audio cerrado');
    return this.context;
  }
  private gain(node:GainNode|undefined,value:number){
    if(node&&this.context)node.gain.setTargetAtTime(value,this.context.currentTime,0.02);
  }
  setMicrophoneVolume(value:number){this.microphoneVolume=clamp(value,200);this.gain(this.micGain,this.microphoneVolume/100);}
  setVoicesVolume(value:number){this.voicesVolume=clamp(value);this.gain(this.voicesGain,this.voicesVolume/100);}
  setMusicVolume(value:number){this.musicVolume=clamp(value);this.gain(this.musicGain,this.musicVolume/100);}
  setMusicLoop(value:boolean){
    this.musicLoop=value;this.fileAudio.loop=value;
    if(this.ambientSource)this.ambientSource.loop=value;
  }
  connectMicrophone(stream:MediaStream){
    if(!this.context)throw new Error('El audio todavía no está listo');
    this.disconnectMicrophone();
    this.micSource=this.context.createMediaStreamSource(stream);
    this.micGain=this.context.createGain();this.micGain.gain.value=this.microphoneVolume/100;
    this.meter=this.context.createAnalyser();this.meter.fftSize=256;
    this.meterValues=new Uint8Array(this.meter.fftSize);
    this.micDestination=this.context.createMediaStreamDestination();
    // Processed outgoing stream and meter only: never feed the microphone to speakers.
    this.micSource.connect(this.micGain).connect(this.meter).connect(this.micDestination);
    this.changed();
  }
  microphoneLevel(){
    if(!this.meter||!this.meterValues)return 0;
    this.meter.getByteTimeDomainData(this.meterValues);
    let sum=0;for(const value of this.meterValues)sum+=((value-128)/128)**2;
    return Math.min(1,Math.sqrt(sum/this.meterValues.length)*4);
  }
  disconnectMicrophone(){
    this.micSource?.disconnect();this.micGain?.disconnect();this.meter?.disconnect();
    this.micDestination?.stream.getTracks().forEach(track=>track.stop());
    this.micSource=undefined;this.micGain=undefined;this.meter=undefined;this.micDestination=undefined;this.meterValues=undefined;
    this.changed();
  }
  // The future call transport hands received streams to this mixer.
  // Ownership of those tracks remains with the transport, not the volume control.
  async connectParticipant(id:string,stream:MediaStream){
    const context=await this.enable();
    this.disconnectParticipant(id);
    const source=context.createMediaStreamSource(stream);source.connect(this.voicesGain!);
    this.voices.set(id,source);this.changed();
  }
  disconnectParticipant(id:string){this.voices.get(id)?.disconnect();this.voices.delete(id);this.changed();}

  private ambientBuffer(context:AudioContext){
    if(this.ambient)return this.ambient;
    const beat=0.625,duration=beat*32,rate=context.sampleRate;
    const buffer=context.createBuffer(1,Math.ceil(rate*duration),rate),samples=buffer.getChannelData(0);
    const note=(midi:number,start:number,length:number,volume:number,triangle=false)=>{
      const frequency=440*2**((midi-69)/12),offset=Math.round(start*rate),count=Math.floor(length*rate);
      for(let i=0;i<count&&offset+i<samples.length;i++){
        const t=i/rate,envelope=Math.min(t/0.03,1)*Math.max(0,1-t/length)**2;
        const wave=Math.sin(2*Math.PI*frequency*t);
        samples[offset+i]!+=(triangle?2/Math.PI*Math.asin(wave):wave)*envelope*volume;
      }
    };
    const chords=[[48,55,60,64],[45,52,57,60],[53,60,65,69],[43,50,55,59]];
    const melody=[72,76,79,76,74,72,67,0,69,72,76,72,71,69,64,0,77,81,84,81,79,77,72,0,74,71,67,71,72,0,67,0];
    for(let bar=0;bar<8;bar++){
      for(const midi of chords[bar%4]!)note(midi,bar*4*beat,4*beat,0.038);
      for(let step=0;step<8;step++){
        const midi=melody[(bar*8+step)%melody.length]!;
        if(midi)note(midi,(bar*4+step/2)*beat,beat*0.6,0.075,true);
      }
    }
    this.ambient=buffer;return buffer;
  }
  useAmbient(){this.stopMusic();this.musicKind='ambient';this.musicError='';this.changed();}
  loadFile(file:File){
    if(!file.type.startsWith('audio/')&&!/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name))throw new Error('Elegí un archivo de audio: MP3, WAV, OGG o M4A.');
    this.stopMusic();
    if(this.fileUrl)URL.revokeObjectURL(this.fileUrl);
    this.fileUrl=URL.createObjectURL(file);this.fileName=file.name;
    this.fileAudio.src=this.fileUrl;this.fileAudio.loop=this.musicLoop;
    this.musicKind='file';this.musicError='';this.changed();
  }
  async playMusic(){
    if(this.musicPlaying)return;
    const request=++this.playRequest;this.musicError='';
    try {
      const context=await this.enable();
      if(request!==this.playRequest)return;
      if(this.musicKind==='file'){
        if(!this.fileUrl)throw new Error('Elegí primero un archivo de música.');
        if(!this.fileSource){this.fileSource=context.createMediaElementSource(this.fileAudio);this.fileSource.connect(this.musicGain!);}
        await this.fileAudio.play();
        if(request!==this.playRequest){this.fileAudio.pause();return;}
      }else{
        const source=context.createBufferSource();source.buffer=this.ambientBuffer(context);source.loop=this.musicLoop;
        source.connect(this.musicGain!);this.ambientSource=source;this.ambientStarted=context.currentTime;
        source.onended=()=>{if(this.ambientSource===source){source.disconnect();this.ambientSource=undefined;this.ambientOffset=0;this.musicPlaying=false;this.changed();}};
        source.start(0,this.ambientOffset%source.buffer.duration);
      }
      this.musicPlaying=true;
    } catch(error){
      if(request!==this.playRequest)return;
      this.musicPlaying=false;this.musicError=error instanceof Error?error.message:'No se pudo iniciar la música.';
    }
    this.changed();
  }
  pauseMusic(){
    this.playRequest++;
    if(this.ambientSource){
      if(this.context&&this.ambient)this.ambientOffset=(this.ambientOffset+this.context.currentTime-this.ambientStarted)%this.ambient.duration;
      const source=this.ambientSource;this.ambientSource=undefined;source.stop();source.disconnect();
    }
    this.fileAudio.pause();this.musicPlaying=false;this.changed();
  }
  stopMusic(){this.pauseMusic();this.ambientOffset=0;if(this.fileUrl)this.fileAudio.currentTime=0;}
  destroy(){
    this.destroyed=true;this.stopMusic();this.disconnectMicrophone();
    for(const source of this.voices.values())source.disconnect();this.voices.clear();
    this.fileAudio.onended=null;this.fileAudio.onerror=null;this.fileAudio.removeAttribute('src');this.fileAudio.load();
    if(this.fileUrl)URL.revokeObjectURL(this.fileUrl);
    this.fileSource?.disconnect();this.voicesGain?.disconnect();this.musicGain?.disconnect();
    void this.context?.close();
  }
}
