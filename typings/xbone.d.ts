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
  constructor(option: any)
}

export default Xbone
