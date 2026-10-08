import { assetById, isBehindObject, objectRect, spriteRect, worldRect, type Direction, type MapBundle, type Scene, type SceneObject } from '@pixel-office/contracts';
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
    context.scale(1.2,1.2);
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
  private objectBehind(object:SceneObject,world:LocalWorld):boolean{
    return isBehindObject(assetById(this.map,object.assetId),object.position,world.position);
  }
  private drawObject(object:SceneObject){
    const asset=assetById(this.map,object.assetId),source=asset.sourceRect;
    const area=spriteRect(this.map,asset.assetId,object.position);
    this.context.drawImage(this.cache.get(asset.assetId),source.x,source.y,source.width,source.height,
      Math.round(area.x),Math.round(area.y),area.width,area.height);
  }
  private drawDebugGeometry(scene:Scene,world:LocalWorld){
    if(!this.debugColliders)return;
    const context=this.context;
    context.save();context.lineWidth=2;
    for(const item of scene.colliders){
      const area=item.area;
      context.fillStyle='#00d4e644';context.fillRect(area.x,area.y,area.width,area.height);
      context.strokeStyle='#00edff';context.strokeRect(area.x,area.y,area.width,area.height);
      context.fillStyle='#fff';context.font='14px system-ui';context.fillText(item.colliderId,area.x+3,area.y+17);
    }
    for(const object of scene.objects){
      const asset=assetById(this.map,object.assetId);
      context.strokeStyle='#00edff';context.setLineDash([]);
      for(const local of asset.colliders){const area=objectRect(local,asset,object.position);
        context.fillStyle='#00d4e644';context.fillRect(area.x,area.y,area.width,area.height);
        context.strokeRect(area.x,area.y,area.width,area.height);
        context.fillStyle='#fff';context.font='15px system-ui';context.fillText(object.objectId,area.x+2,area.y+16);
      }
      if(asset.depth){const area=spriteRect(this.map,asset.assetId,object.position);
        context.strokeStyle='#ffa54d';context.setLineDash([4,4]);context.beginPath();
        for(const rule of [asset.depth,asset.depth.secondary].filter(item=>item!==undefined)){
          const value=object.position[rule.axis]+rule.offset*asset.worldScale;
          if(rule.axis==='x'){context.moveTo(value,area.y);context.lineTo(value,area.y+area.height);}
          else {context.moveTo(area.x,value);context.lineTo(area.x+area.width,value);}
        }
        context.stroke();
      }
    }
    context.strokeStyle='#ffe376';
    for(const item of scene.interactions){const area=item.area;context.strokeRect(area.x,area.y,area.width,area.height);}
    context.strokeStyle='#76baff';
    for(const area of scene.windows)context.strokeRect(area.x,area.y,area.width,area.height);
    context.setLineDash([]);
    const foot=worldRect(this.map.avatar.footCollider,world.position);
    context.fillStyle='#aaff76aa';context.fillRect(foot.x,foot.y,foot.width,foot.height);
    context.strokeStyle='#aaff76';context.strokeRect(foot.x,foot.y,foot.width,foot.height);
    context.beginPath();context.arc(world.position.x,world.position.y,5,0,Math.PI*2);context.fillStyle='#f43f5e';context.fill();
    context.fillStyle='#15212bd9';context.fillRect(1000,475,885,31);
    context.fillStyle='#f1f4f4';context.font='19px system-ui';context.textAlign='left';
    context.fillText('Cian: collider · Naranja: profundidad · Verde: pies · Rojo: punto de pies',1008,497);
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
    const objects=[...scene.objects].sort((a,b)=>assetById(this.map,a.assetId).renderOrder-assetById(this.map,b.assetId).renderOrder);
    const behindAvatar=new Set(objects.filter(object=>this.objectBehind(object,world)).map(object=>object.objectId));
    // The left desk must cover its chair even when the avatar is behind only the chair.
    if(behindAvatar.has('west-chair'))behindAvatar.add('west-desk');
    for(const object of objects)if(!behindAvatar.has(object.objectId))this.drawObject(object);
    context.drawImage(this.cache.get(avatarId),source.x,source.y,source.width,source.height,
      Math.round(avatarRect.x),Math.round(avatarRect.y),avatarRect.width,avatarRect.height);
    for(const object of objects)if(behindAvatar.has(object.objectId))this.drawObject(object);
    context.fillStyle='#f4f4dc';context.font='bold 19px system-ui';context.textAlign='center';
    context.fillText('Vos',position.x,avatarRect.y-8);
    this.drawDebugGeometry(scene,world);
    return trainAnimating;
  }
  destroy(){this.floor.width=0;this.floor.height=0;this.canvas.width=0;this.canvas.height=0;}
}
