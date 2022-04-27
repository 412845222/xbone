import Victor from 'victor'

export type XboneClientScene = 'web' | 'ohos'

export type XboneCoordinate = 'x' | 'y'

export type XboneSize = 'width' | 'height'

export interface XboneOPtions {
  ctx: HTMLCanvasElement
  clientScene: XboneClientScene
  animeCall(anime_gridlist: any[]): void
  data: {
    clientScene: XboneClientScene
    zeroOrg: Record<XboneCoordinate, number>
    build_canvas_size: Record<XboneSize, number>
    imgPoint_list: Record<XboneCoordinate, number>[]
    imgScale_list: number[]
    grid_list: Record<'gridingPoint', XboneCoordinate>[]
    imgInfo_list: Record<XboneSize | 'imageData', number | null>[]
    keyframes: any[]
    img_data: Record<'uri' | 'base64Data', string>[]
  }
  width: number
  height: number
}

declare class Xbone {
  constructor(option: XboneOPtions)
  init(): void
  /**
   * 播放动画
   */
  play(): void
  /**
   * 暂停动画
   */
  pause(): void
  animeClear(): void
  checkBoneAnime(): any[]
  getAnimeGridList(): any[]
  reloadImgDraw(): void
  drawImageItem(
    img: ImageData,
    imageScale: number,
    img_width?: null | number,
    img_height?: null | number
  ): void
  gridDataRelative(index: number, griding_info?: any): void
  drawGridItem(
    info: Record<
      | 'img'
      | 'img_point'
      | 'gridingPoint'
      | 'triangleList'
      | 'img_width'
      | 'img_height'
      | 'boneList'
      | 'bone_weight'
      | 'boneMoved_angle',
      any
    >
  ): void
  getParentBoneRotatePoint(
    point: unknown,
    boneList: unknown,
    b_idx: unknown,
    img_point: unknown,
    angleList: unknown[]
  ): Victor
  replaceRotatePoint(
    angle: unknown,
    bone: unknown,
    point: unknown,
    img_point: unknown
  ): Victor
  getTransformMatrix(old_t, new_t): any[]
  getItemList(numList: unknown[], m, n): any[]
  setImgPointList(imgPointList: unknown[]): void
  setScaleList(scale_list): void
  setGrid_list(grid_list): void
  setBoneMoved_angle(info, index, boneIndex, angle): any
  getPointByOffsetAndAngle(point, offset, angle, dl): Record<'x' | 'y', number>
  subBoneLinkAge(info, boneIndex): any
  getRotateByMouseMove(orgP, startP, endP): number
  pow(x: number): number
  diffPow(x: number, y: number): number
  replaceRotateBonePoint(angle, bone, point, img_point): Victor
  getTwoPointAngle(bone): number
  clearCanvas(): void
}

export { Xbone }
