import { assetById, overlaps, spriteRect, worldRect, type Direction, type MapBundle, type Rect, type Scene } from '@pixel-office/contracts';
import { type LocalWorld } from '../engine/world';
import { type AssetCache } from './assets';

export class Renderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly floor=document.createElement('canvas');
  private readonly debugColliders=import.meta.env.DEV && new URLSearchParams(window.location.search).get('debug')==='colliders';
  private sceneId='';
  private animationDirection: Direction | undefined;
  private animationTime=0;
  private trainTime=0;
  constructor(private readonly canvas:HTMLCanvasElement,private readonly map:MapBundle,private readonly cache:AssetCache){
    const context=canvas.getContext('2d');
    if(!context)throw new Error('El navegador no permite dibujar la oficina.');
    this.context=context;
  }
  private prepareFloor(scene:Scene){
    this.sceneId=scene.sceneId;
    this.floor.width=scene.logicalSize.width;this.floor.height=scene.logicalSize.height;
    const context=this.floor.getContext('2d');
    if(!context)throw new Error('No se pudo preparar la oficina');
    context.imageSmoothingEnabled=false;
    const asset=assetById(this.map,scene.background.assetId);
    const source=asset.sourceRect;
    context.fillStyle=scene.background.color;
    context.fillRect(0,0,this.floor.width,this.floor.height);
    context.drawImage(this.cache.get(asset.assetId),source.x,source.y,source.width,source.height,0,0,this.floor.width,this.floor.height);
  }
  private drawTrain(scene:Scene,seconds:number){
    if(!scene.trainFrames.length)return false;
    const duration=scene.trainFrames.reduce((sum,frame)=>sum+frame.durationMs,0);
    this.trainTime=(this.trainTime+seconds*1000)%duration;
    let elapsed=this.trainTime;
    let selected=scene.trainFrames[0]!;
    for(const frame of scene.trainFrames){selected=frame;if(elapsed<frame.durationMs)break;elapsed-=frame.durationMs;}
    const image=this.cache.get(selected.assetId);
    const context=this.context;
    for(const window of scene.windows){
      context.save();
      context.beginPath();context.rect(window.x,window.y,window.width,window.height);context.clip();
      context.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,window.x,window.y,window.width,window.height);
      context.restore();
    }
    return scene.trainFrames.length>1;
  }
  private drawBoard(scene:Scene,dirty:boolean){
    if(!dirty)return;
    const context=this.context;
    context.save();
    context.beginPath();
    scene.boardCorners.forEach((corner,index)=>index?context.lineTo(corner.x,corner.y):context.moveTo(corner.x,corner.y));
    context.closePath();context.clip();
    // Temporary visible state until Peredo's clean/dirty exports arrive.
    context.strokeStyle='#64849b';context.lineWidth=3;context.lineCap='square';
    for(const {x,y,width} of [{x:1404,y:231,width:48},{x:1404,y:244,width:55},{x:1410,y:257,width:45},{x:1417,y:271,width:36}]){
      context.beginPath();context.moveTo(x,y);context.lineTo(x+width,y+Math.round(width*.47));context.stroke();
    }
    context.restore();
  }
  private avatarAsset(world:LocalWorld,seconds:number){
    const {direction}=world;
    if(!world.moving){this.animationDirection=undefined;this.animationTime=0;return this.map.avatar.views[direction];}
    if(this.animationDirection!==direction){this.animationDirection=direction;this.animationTime=0;}
    const frames=this.map.avatar.animations[direction];
    const duration=frames.reduce((sum,frame)=>sum+frame.durationMs,0);
    this.animationTime=(this.animationTime+seconds*1000)%duration;
    let elapsed=this.animationTime;
    for(const frame of frames){if(elapsed<frame.durationMs)return frame.assetId;elapsed-=frame.durationMs;}
    return frames[0]!.assetId;
  }
  private drawOcclusion(scene:Scene,world:LocalWorld,avatarRect:Rect){
    const context=this.context;
    for(const occluder of scene.occluders){
      if(world.position.y>occluder.baseY||!overlaps(occluder.area,avatarRect))continue;
      const area=occluder.area;
      context.save();
      context.beginPath();
      occluder.polygon.forEach((point,index)=>index?context.lineTo(point.x,point.y):context.moveTo(point.x,point.y));
      context.closePath();context.clip();
      context.globalAlpha=0.1; // An obstructing object is 90% transparent over the avatar.
      context.drawImage(this.floor,area.x,area.y,area.width,area.height,area.x,area.y,area.width,area.height);
      context.restore();
    }
  }
  private drawDebugGeometry(scene:Scene,world:LocalWorld){
    if(!this.debugColliders)return;
    const context=this.context;
    context.save();context.lineWidth=2;
    for(const item of scene.colliders){
      const area=item.area;
      context.fillStyle='#00d4e644';context.fillRect(area.x,area.y,area.width,area.height);
      context.strokeStyle='#00edff';context.strokeRect(area.x,area.y,area.width,area.height);
    }
    context.strokeStyle='#ed7bdd';context.setLineDash([8,6]);
    for(const item of scene.occluders){
      context.beginPath();
      item.polygon.forEach((point,index)=>index?context.lineTo(point.x,point.y):context.moveTo(point.x,point.y));
      context.closePath();context.stroke();
    }
    context.strokeStyle='#ffe376';
    for(const item of scene.interactions){const area=item.area;context.strokeRect(area.x,area.y,area.width,area.height);}
    context.strokeStyle='#76baff';
    for(const area of scene.windows)context.strokeRect(area.x,area.y,area.width,area.height);
    context.setLineDash([]);
    const foot=worldRect(this.map.avatar.footCollider,world.position);
    context.fillStyle='#aaff76aa';context.fillRect(foot.x,foot.y,foot.width,foot.height);
    context.strokeStyle='#aaff76';context.strokeRect(foot.x,foot.y,foot.width,foot.height);
    context.fillStyle='#15212bd9';context.fillRect(100,240,685,31);
    context.fillStyle='#f1f4f4';context.font='19px system-ui';context.textAlign='left';
    context.fillText('Cian: sólido · Magenta: oclusión · Amarillo: interacción · Verde: pies',108,262);
    context.restore();
  }
  draw(world:LocalWorld,seconds:number):boolean{
    const {scene,position}=world;
    if(scene.sceneId!==this.sceneId)this.prepareFloor(scene);
    const bounds=this.canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);
    const width=Math.max(1,Math.round(bounds.width*dpr)),height=Math.max(1,Math.round(bounds.height*dpr));
    if(width!==this.canvas.width||height!==this.canvas.height){this.canvas.width=width;this.canvas.height=height;}
    const context=this.context;
    context.setTransform(1,0,0,1,0,0);context.imageSmoothingEnabled=false;
    context.fillStyle='#182936';context.fillRect(0,0,width,height);
    const scale=Math.min(width/scene.logicalSize.width,height/scene.logicalSize.height);
    context.translate((width-scene.logicalSize.width*scale)/2,(height-scene.logicalSize.height*scale)/2);
    context.scale(scale,scale);
    context.drawImage(this.floor,0,0);
    const trainAnimating=this.drawTrain(scene,seconds);
    this.drawBoard(scene,world.boardDirty);
    const avatarId=this.avatarAsset(world,seconds);
    const asset=assetById(this.map,avatarId),source=asset.sourceRect;
    const avatarRect=spriteRect(this.map,avatarId,position);
    context.drawImage(this.cache.get(avatarId),source.x,source.y,source.width,source.height,
      Math.round(avatarRect.x),Math.round(avatarRect.y),avatarRect.width,avatarRect.height);
    this.drawOcclusion(scene,world,avatarRect);
    if(world.boardDirty && position.y<=359)this.drawBoard(scene,true);
    context.fillStyle='#f4f4dc';context.font='bold 19px system-ui';context.textAlign='center';
    context.fillText('Vos',position.x,avatarRect.y-8);
    this.drawDebugGeometry(scene,world);
    return trainAnimating;
  }
  destroy(){this.floor.width=0;this.floor.height=0;this.canvas.width=0;this.canvas.height=0;}
}
