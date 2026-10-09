export interface Preferences {
  displayName: string;
  microphoneVolume: number;
  voicesVolume: number;
  musicVolume: number;
  musicLoop: boolean;
}

const key='pixel-office.preferences.v1';
const defaults:Preferences={displayName:'',microphoneVolume:100,voicesVolume:80,musicVolume:35,musicLoop:true};
const level=(value:unknown,fallback:number,max=100)=>typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(max,value)):fallback;
export const cleanName=(value:string)=>value.replace(/[\u0000-\u001f\u007f]/g,'').trim().replace(/\s+/g,' ').slice(0,24);

export function loadPreferences():Preferences {
  try {
    const saved=JSON.parse(sessionStorage.getItem(key)||'{}') as Partial<Preferences>;
    return {displayName:typeof saved.displayName==='string'?cleanName(saved.displayName):'',
      microphoneVolume:level(saved.microphoneVolume,100,200),voicesVolume:level(saved.voicesVolume,80),
      musicVolume:level(saved.musicVolume,35),musicLoop:typeof saved.musicLoop==='boolean'?saved.musicLoop:true};
  } catch { return {...defaults}; }
}
export function savePreferences(value:Preferences){
  // Only this browser tab's session. Media permissions/playback are never restored.
  try { sessionStorage.setItem(key,JSON.stringify(value)); } catch { /* Storage can be unavailable. */ }
}
