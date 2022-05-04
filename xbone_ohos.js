/* eslint-disable */

/*
 * xbone.js v1.0.0
 * (c) 2020 Dweb·九弓子(Zhang Xuqian)
 * Released under the MIT license
 * https://xstory.dweb.club
 */

import Victor from './utils/victor/victor.js'
import { Matrix3 } from './utils/math/three.js'
import anime from './utils/anime/anime.js'

// import Victor from 'victor'
// import { Matrix3 } from 'three'
// import anime from './utils/anime/anime.js'

// if Xbone.clientScene == "web" && use All animejs
// import anime from "animejs";

export class Xbone {
  imgInfo_list = []
  imgPoint_list = []
  imgScale_list = []
  grid_list = []
  anime_gridList = []
  keyframes = []
  zeroOrg = {}
  scale = 1
  loop = true
  autoplay = true
  clientScene = 'web'
  relative_scale = 1

  animeCall = null
  scale_anime = []
  position_anime = []
  bone_anime = []
  mainAnime = null

  constructor(option) {
    this.ctx = option.ctx
    this.clientScene = option.clientScene
    this.animeCall = option.animeCall
    this.xboneData = option.data
    this.imgInfo_list = this.xboneData.imgInfo_list
    this.imgPoint_list = this.xboneData.imgPoint_list
    this.imgScale_list = this.xboneData.imgScale_list
    this.grid_list = this.xboneData.grid_list
    this.zeroOrg = this.xboneData.zeroOrg
    this.keyframes = this.xboneData.keyframes
    this.width = option.width
    this.height = option.height
    this.relative_scale = this.width / this.xboneData.build_canvas_size.width
    this.init()
  }

  init() {
    this.xboneData.img_data.forEach((item, index) => {
      let img = new Image()
      let img_width = this.imgInfo_list[index].width
      let img_height = this.imgInfo_list[index].height
      if (this.clientScene == 'ohos') {
        if (item.base64Data.length > 0) {
          img.src = item.base64Data
          img.onload = () => {
            this.imgInfo_list[index].imageData = img
            this.imgInfo_list[index].imageData.width = img_width
            this.imgInfo_list[index].imageData.height = img_height
          }
        } else {
          img.src = item.uri
          img.onload = () => {
            this.imgInfo_list[index].imageData = img
            this.imgInfo_list[index].imageData.width = img_width
            this.imgInfo_list[index].imageData.height = img_height
          }
        }

        if (this.grid_list[index] != null) {
          this.gridDataRelative(index)
        } else {
          this.drawImageItem(
            img,
            this.imgPoint_list[index],
            this.imgScale_list[index],
            img_width,
            img_height
          )
        }
      } else {
        img.src = item.base64Data
        this.imgInfo_list[index].imageData = img
        this.imgInfo_list[index].imageData.width = img_width
        this.imgInfo_list[index].imageData.height = img_height
        if (this.grid_list[index] != null) {
          this.gridDataRelative(index)
        } else {
          this.drawImageItem(
            img,
            this.imgPoint_list[index],
            this.imgScale_list[index],
            img_width,
            img_height
          )
        }
      }
    })

    let attr_list = []
    let scale_keyframe_list = []
    let imgPoint_keyframe_list = []
    let griding_keyframe_list = []
    this.keyframes.forEach((item) => {
      let attr_item = {
        value: item.time * 100,
        keytime: item.time,
        duration: item.time,
      }
      if (attr_list.length > 0) {
        let new_time =
          attr_item.keytime - attr_list[attr_list.length - 1].keytime
        attr_item.duration = new_time
        attr_list.push(attr_item)
      } else {
        attr_list.push(attr_item)
      }

      //缩放关键帧
      let scale_keyframe_item = {
        scaleList: item.canvasData.scaleList,
        keytime: item.time,
        duration: item.time,
      }
      if (scale_keyframe_list.length > 0) {
        let new_time =
          scale_keyframe_item.keytime -
          scale_keyframe_list[scale_keyframe_list.length - 1].keytime
        scale_keyframe_item.duration = new_time
        scale_keyframe_list.push(scale_keyframe_item)
      } else {
        scale_keyframe_list.push(scale_keyframe_item)
      }
      //位置关键帧
      let imgPoint_keyframe_item = {
        imgPointList: item.canvasData.imgPointList,
        keytime: item.time,
        duration: item.time,
      }
      if (imgPoint_keyframe_list.length > 0) {
        let new_time =
          imgPoint_keyframe_item.keytime -
          imgPoint_keyframe_list[imgPoint_keyframe_list.length - 1].keytime
        imgPoint_keyframe_item.duration = new_time
        imgPoint_keyframe_list.push(imgPoint_keyframe_item)
      } else {
        imgPoint_keyframe_list.push(imgPoint_keyframe_item)
      }
      //骨骼关键帧
      let griding_keyframe_item = {
        gridingData: item.canvasData.gridingData,
        keytime: item.time,
        duration: item.time,
      }
      if (griding_keyframe_list.length > 0) {
        let new_time =
          griding_keyframe_item.keytime -
          griding_keyframe_list[griding_keyframe_list.length - 1].keytime
        griding_keyframe_item.duration = new_time
        griding_keyframe_list.push(griding_keyframe_item)
      } else {
        griding_keyframe_list.push(griding_keyframe_item)
      }
    })

    if (this.keyframes.length > 0) {
      // let griding_list = []
      let griding_list = JSON.parse(
        JSON.stringify(this.keyframes[0].canvasData.gridingData)
      )
      griding_list.forEach((griding, g_idx) => {
        if (griding != null) {
          let boneMoved_angle = griding.boneMoved_angle
          let boneList = griding.boneList
          boneMoved_angle.forEach((angle, b_idx) => {
            let bone_obj = {
              angle: angle,
              x1: boneList[b_idx].x1,
              y1: boneList[b_idx].y1,
              x2: boneList[b_idx].x2,
              y2: boneList[b_idx].y2,
              x3: boneList[b_idx].x3,
              y3: boneList[b_idx].y3,
            }
            let keyframes = []
            griding_keyframe_list.forEach((item) => {
              let keyframe = {
                angle: item.gridingData[g_idx].boneMoved_angle[b_idx],
                x1: item.gridingData[g_idx].boneList[b_idx].x1,
                y1: item.gridingData[g_idx].boneList[b_idx].y1,
                x2: item.gridingData[g_idx].boneList[b_idx].x2,
                y2: item.gridingData[g_idx].boneList[b_idx].y2,
                x3: item.gridingData[g_idx].boneList[b_idx].x3,
                y3: item.gridingData[g_idx].boneList[b_idx].y3,
                duration: item.duration,
              }
              keyframes.push(keyframe)
            })
            let griding_anime = new anime({
              targets: bone_obj,
              keyframes: keyframes,
              easing: 'linear',
              loop: this.loop,
              autoplay: this.autoplay,
              update: () => {
                griding_list[g_idx] = this.setBoneMoved_angle(
                  griding_list[g_idx],
                  g_idx,
                  b_idx,
                  bone_obj.angle
                )
                this.anime_gridList = griding_list
                //                this.reloadImgDraw(griding_list);
              },
            })
            this.bone_anime.push(griding_anime)
          })
        }
      })

      let scale_list = JSON.parse(
        JSON.stringify(this.keyframes[0].canvasData.scaleList)
      )
      this.scale_anime = []
      scale_list.forEach((scale, index) => {
        let scale_obj = {
          value: scale,
        }
        let keyframs = []
        scale_keyframe_list.forEach((item) => {
          let keyframe = {
            value: item.scaleList[index],
            duration: item.duration,
          }
          keyframs.push(keyframe)
        })

        let scale_anime = new anime({
          targets: scale_obj,
          value: keyframs,
          easing: 'linear',
          loop: this.loop,
          autoplay: this.autoplay,
          update: () => {
            scale_list[index] = scale_obj.value
            this.setScaleList(scale_list)
            //            this.reloadImgDraw();
            //            if (griding_list.length==0) {
            //              this.reloadImgDraw()
            //            }
          },
        })

        this.scale_anime.push(scale_anime)
      })

      let imgPoint_list = JSON.parse(
        JSON.stringify(this.keyframes[0].canvasData.imgPointList)
      )
      this.position_anime = []
      imgPoint_list.forEach((imgPoint, index) => {
        let imgPoint_obj = {
          x: imgPoint.x,
          y: imgPoint.y,
        }
        let keyframs = []
        imgPoint_keyframe_list.forEach((item) => {
          let keyframe = {
            x: item.imgPointList[index].x,
            y: item.imgPointList[index].y,
            duration: item.duration,
          }
          keyframs.push(keyframe)
        })
        let imgPoint_anime = new anime({
          targets: imgPoint_obj,
          keyframes: keyframs,
          easing: 'linear',
          loop: this.loop,
          autoplay: this.autoplay,
          update: () => {
            imgPoint_list[index].x = imgPoint_obj.x + this.zeroOrg.x
            imgPoint_list[index].y = imgPoint_obj.y + this.zeroOrg.y
            this.setImgPointList(imgPoint_list)
            //             this.reloadImgDraw();
            //            if (griding_list.length==0) {
            //              this.reloadImgDraw()
            //            }
          },
        })
        this.position_anime.push(imgPoint_anime)
      })

      let mainAnimeCall = {
        call: 0,
      }
      this.mainAnime = new anime({
        targets: mainAnimeCall,
        call: attr_list,
        easing: 'linear',
        loop: this.loop,
        autoplay: this.autoplay,
        update: () => {
          // console.log(JSON.stringify(e));
          this.animeCall(this.anime_gridList)
        },
        complete: () => {
          // this.animeStop()
        },
      })
    }
  }

  //动画控制
  play() {
    this.mainAnime.play()
    this.scale_anime.forEach((item) => {
      item.play()
    })
    this.position_anime.forEach((item) => {
      item.play()
    })
    this.bone_anime.forEach((item) => {
      item.play()
    })
  }
  pause() {
    this.mainAnime.pause()
    this.scale_anime.forEach((item) => {
      item.pause()
    })
    this.position_anime.forEach((item) => {
      item.pause()
    })
    this.bone_anime.forEach((item) => {
      item.pause()
    })
  }
  animeClear() {
    this.scale_anime = []
    this.position_anime = []
    this.bone_anime = []
  }
  checkBoneAnime() {
    return this.bone_anime
  }
  getAnimeGridList() {
    return this.anime_gridList
  }
  reloadImgDraw(griding_list = []) {
    this.ctx.save()
    this.clearCanvas()
    this.imgInfo_list.forEach((item, index) => {
      let img = item.imageData
      let img_width = item.width
      let img_height = item.height
      if (this.grid_list[index] != null) {
        if (griding_list.length == 0) {
          this.gridDataRelative(index)
        } else {
          this.gridDataRelative(index, griding_list[index])
        }
      } else {
        this.drawImageItem(
          img,
          this.imgPoint_list[index],
          this.imgScale_list[index],
          img_width,
          img_height
        )
      }
    })
    this.ctx.restore()
  }
  drawImageItem(img, imgPoint, imgScale, img_width = null, img_height = null) {
    let imgpoint = {
      x: imgPoint.x - this.zeroOrg.x,
      y: imgPoint.y - this.zeroOrg.y,
    }
    let imgWidth = img_width || img.width
    let imgHeight = img_height || img.height
    this.ctx.drawImage(
      img,
      imgpoint.x * this.relative_scale,
      imgpoint.y * this.relative_scale,
      imgWidth * this.relative_scale * this.scale * imgScale,
      imgHeight * this.relative_scale * this.scale * imgScale
    )
  }
  gridDataRelative(index, griding_info = null) {
    let img = this.imgInfo_list[index].imageData

    let info = this.grid_list[index]
    if (griding_info != null) {
      info = griding_info
    }
    let gridingPoint = info.gridingPoint
    let triangleList = this.grid_list[index].triangleList
    let img_point = info.img_point
    let img_width = info.img_width
    let boneList = info.boneList
    let bone_weight = info.bone_weight
    let boneMoved_angle = info.boneMoved_angle
    let imgPoint = this.imgPoint_list[index]
    let reload_point = {
      x: imgPoint.x - this.zeroOrg.x,
      y: imgPoint.y - this.zeroOrg.y,
    }
    reload_point = new Victor(
      reload_point.x * this.relative_scale,
      reload_point.y * this.relative_scale
    )
    let reload_img_width =
      this.imgInfo_list[index].width *
      this.imgScale_list[index] *
      this.relative_scale *
      this.scale
    let reload_img_height =
      this.imgInfo_list[index].height *
      this.imgScale_list[index] *
      this.relative_scale *
      this.scale
    let relative_scale = reload_img_width / img_width
    let relative_point = reload_point

    let relative_img_point_move = new Victor(
      relative_point.x - img_point.x * relative_scale,
      relative_point.y - img_point.y * relative_scale
    )

    let boneList_relative = []
    boneList.forEach((bone) => {
      let temp_bone = [null, null, null]
      temp_bone[0] = new Victor(
        bone[0].x * relative_scale + relative_img_point_move.x,
        bone[0].y * relative_scale + relative_img_point_move.y
      )
      temp_bone[1] = new Victor(
        bone[1].x * relative_scale + relative_img_point_move.x,
        bone[1].y * relative_scale + relative_img_point_move.y
      )
      temp_bone[2] = new Victor(
        bone[2].x * relative_scale + relative_img_point_move.x,
        bone[2].y * relative_scale + relative_img_point_move.y
      )
      boneList_relative.push(temp_bone)
    })

    let gridingPoint_relative = []
    gridingPoint.forEach((point) => {
      let temp_point = new Victor(
        point.x * relative_scale,
        point.y * relative_scale
      )
      gridingPoint_relative.push(temp_point)
    })

    let relative_info = {
      img: img,
      img_point: relative_point,
      img_width: reload_img_width,
      img_height: reload_img_height,
      gridingPoint: gridingPoint_relative,
      bone_weight: bone_weight,
      boneList: boneList_relative,
      boneMoved_angle: boneMoved_angle,
      triangleList: triangleList,
    }
    this.drawGridItem(relative_info)
  }

  drawGridItem(info) {
    let img = info.img
    let img_point = info.img_point
    let gridingPoint = info.gridingPoint
    let triangleList = info.triangleList
    let img_width = info.img_width
    let img_height = info.img_height
    let boneList = info.boneList
    let bone_weight = info.bone_weight
    let angle = info.boneMoved_angle

    let def_mesh = []
    this.ctx.save()
    this.ctx.translate(img_point.x, img_point.y)
    boneList.forEach((bone, b_idx) => {
      let bone_belong_point = []
      let transformList = null

      triangleList.forEach((triangle) => {
        let temp_pointList = triangle
        let point1 = gridingPoint[temp_pointList[0]]
        let point2 = gridingPoint[temp_pointList[1]]
        let point3 = gridingPoint[temp_pointList[2]]
        let weight1 = bone_weight[temp_pointList[0]]
        let weight2 = bone_weight[temp_pointList[1]]
        let weight3 = bone_weight[temp_pointList[2]]
        let new_t = [point1, point2, point3]
        let old_t = [point1, point2, point3]
        let replacePoint1 = point1
        let replacePoint2 = point2
        let replacePoint3 = point3

        if (
          weight1 == weight2 &&
          weight2 == weight3 &&
          weight1 == weight3 &&
          weight3 == b_idx
        ) {
          bone_belong_point.push([point1, point2, point3])
          replacePoint1 = this.getParentBoneRotatePoint(
            point1,
            boneList,
            weight1,
            img_point,
            angle
          )
          replacePoint2 = this.getParentBoneRotatePoint(
            point2,
            boneList,
            weight2,
            img_point,
            angle
          )
          replacePoint3 = this.getParentBoneRotatePoint(
            point3,
            boneList,
            weight3,
            img_point,
            angle
          )
          new_t = [replacePoint1, replacePoint2, replacePoint3]
          let getTransform = this.getTransformMatrix(old_t, new_t)
          if (getTransform != null && transformList == null) {
            transformList = getTransform
          }
        } else {
          let def_mesh_Point1 = this.getParentBoneRotatePoint(
            point1,
            boneList,
            weight1,
            img_point,
            angle
          )
          let def_mesh_Point2 = this.getParentBoneRotatePoint(
            point2,
            boneList,
            weight2,
            img_point,
            angle
          )
          let def_mesh_Point3 = this.getParentBoneRotatePoint(
            point3,
            boneList,
            weight3,
            img_point,
            angle
          )
          let def_new_t = [def_mesh_Point1, def_mesh_Point2, def_mesh_Point3]
          let def_transformList = this.getTransformMatrix(old_t, def_new_t)
          let def_mesh_item = {
            new_t: [def_mesh_Point1, def_mesh_Point2, def_mesh_Point3],
            transformList: def_transformList,
          }
          def_mesh.push(def_mesh_item)
        }
      })
      if (def_mesh.length == 0) {
        this.ctx.save()
        this.ctx.transform(
          transformList[0][0],
          transformList[0][1],
          transformList[1][0],
          transformList[1][1],
          transformList[2][0],
          transformList[2][1]
        )
        this.ctx.drawImage(img, 0, 0, img_width, img_height)
        this.ctx.restore()
      }
    })
    this.ctx.restore()

    let def_transformList = null
    this.ctx.save()
    this.ctx.translate(img_point.x, img_point.y)
    def_mesh.forEach((mesh) => {
      this.ctx.beginPath()
      let new_t = mesh.new_t
      this.ctx.moveTo(new_t[0].x, new_t[0].y)
      this.ctx.lineTo(new_t[1].x, new_t[1].y)
      this.ctx.lineTo(new_t[2].x, new_t[2].y)
      this.ctx.closePath()
      def_transformList = mesh.transformList
      this.ctx.save()
      this.ctx.clip()
      if (def_transformList != null) {
        this.ctx.transform(
          def_transformList[0][0],
          def_transformList[0][1],
          def_transformList[1][0],
          def_transformList[1][1],
          def_transformList[2][0],
          def_transformList[2][1]
        )
      }
      this.ctx.drawImage(img, 0, 0, img_width, img_height)
      this.ctx.restore()
      if (this.clientScene == 'web') {
        this.ctx.save()
        this.ctx.clip()
        if (def_transformList != null) {
          this.ctx.transform(
            def_transformList[0][0],
            def_transformList[0][1],
            def_transformList[1][0],
            def_transformList[1][1],
            def_transformList[2][0],
            def_transformList[2][1]
          )
        }
        this.ctx.drawImage(img, 0, 0, img_width, img_height)
        this.ctx.restore()
        this.ctx.save()
        this.ctx.clip()
        if (def_transformList != null) {
          this.ctx.transform(
            def_transformList[0][0],
            def_transformList[0][1],
            def_transformList[1][0],
            def_transformList[1][1],
            def_transformList[2][0],
            def_transformList[2][1]
          )
        }
        this.ctx.drawImage(img, 0, 0, img_width, img_height)
        this.ctx.restore()
      }
    })
    this.ctx.restore()
  }

  getParentBoneRotatePoint(point, boneList, b_idx, img_point, angleList) {
    let bone = boneList[0]
    let root_angle = angleList[0]
    let root_bone_rotate_point = this.replaceRotatePoint(
      root_angle,
      bone,
      point,
      img_point
    )
    let retrun_point = root_bone_rotate_point
    // return retrun_point;
    for (let i = 1; i <= b_idx; i++) {
      let bone = boneList[i]
      bone = [
        new Victor(bone[0].x, bone[0].y),
        new Victor(bone[1].x, bone[1].y),
        new Victor(bone[2].x, bone[2].y),
      ]
      let point = retrun_point
      let init_angle = 0
      let angle = angleList[i]
      let new_point = this.replaceRotatePoint(
        angle + init_angle,
        bone,
        point,
        img_point
      )
      new_point = new Victor(new_point.x, new_point.y)
      img_point = new Victor(img_point.x, img_point.y)
      retrun_point = new_point
    }
    return retrun_point
  }
  replaceRotatePoint(angle, bone, point, img_point) {
    let orgP = new Victor(bone[1].x, bone[1].y)
    let newP = new Victor(point.x, point.y)
    let relativeP = newP.subtract(orgP.subtract(img_point))
    let newP_rotate = relativeP.rotate((-angle * Math.PI) / 180)
    let newP_rotate_add = newP_rotate.add(orgP)
    return newP_rotate_add
  }
  getTransformMatrix(old_t, new_t) {
    let matrixFrom = null
    let matrixTo = null
    let matrixTransform = new Matrix3()
    let itemList = null

    matrixFrom = new Matrix3()
    matrixFrom.set(
      old_t[0].x,
      old_t[0].y,
      1,
      old_t[1].x,
      old_t[1].y,
      1,
      old_t[2].x,
      old_t[2].y,
      1
    )
    matrixTo = new Matrix3()
    matrixTo.set(
      new_t[0].x,
      new_t[0].y,
      1,
      new_t[1].x,
      new_t[1].y,
      1,
      new_t[2].x,
      new_t[2].y,
      1
    )

    matrixTransform = matrixTransform.multiplyMatrices(
      matrixFrom.invert(),
      matrixTo
    )

    if (matrixTransform == null) {
      return null
    }
    itemList = this.getItemList(matrixTransform.elements, 3, 3)
    return itemList
  }

  getItemList(numList, m, n) {
    if (!(m && n && m * n === numList.length)) {
      console.error('Matrix Error')
    }
    let i, j, itemList, subItemList
    itemList = new Array(m)
    for (i = 0; i < m; i++) {
      subItemList = new Array(n)
      for (j = 0; j < n; j++) {
        subItemList[j] = numList[j * m + i].toFixed(3)
      }
      itemList[i] = subItemList
    }
    return itemList
  }

  setImgPointList(imgPointList) {
    this.imgPoint_list = imgPointList
  }
  setScaleList(scale_list) {
    this.imgScale_list = scale_list
  }
  setGrid_list(grid_list) {
    this.grid_list = grid_list
  }
  setBoneMoved_angle(info, index, boneIndex, angle) {
    let boneList = info.boneList
    let boneMoved_angle = info.boneMoved_angle
    let initialBoneList = info.initialBoneList
    let initBone = JSON.parse(initialBoneList[boneIndex])
    initBone = [
      new Victor(initBone[0].x, initBone[0].y),
      new Victor(initBone[1].x, initBone[1].y),
      new Victor(initBone[2].x, initBone[2].y),
    ]
    let img_point = info.img_point
    let initBone_angle = info.initBone_angle
    let init_angle = initBone_angle[boneIndex]

    let rotateBone = boneList[boneIndex]
    rotateBone = [
      new Victor(rotateBone[0].x, rotateBone[0].y),
      new Victor(rotateBone[1].x, rotateBone[1].y),
      new Victor(rotateBone[2].x, rotateBone[2].y),
    ]
    if (boneIndex > 0) {
      let pre_bone = boneList[boneIndex - 1]
      pre_bone = [
        new Victor(pre_bone[0].x, pre_bone[0].y),
        new Victor(pre_bone[1].x, pre_bone[1].y),
        new Victor(pre_bone[2].x, pre_bone[2].y),
      ]
      let offset_move = pre_bone[0].clone().subtract(initBone[1])
      let new_point = initBone[0].clone().add(offset_move)
      for (let i = 0; i < boneIndex; i++) {
        let angle = boneMoved_angle[i]
        let bone = boneList[i]
        new_point = this.replaceRotateBonePoint(
          angle,
          bone,
          new_point,
          img_point
        )
      }
      rotateBone[0] = new_point
      init_angle = this.getTwoPointAngle(rotateBone)
    }

    let orgPoint = rotateBone[1]
    if (boneIndex > 0) {
      orgPoint = boneList[boneIndex - 1][0]
    }
    let dl = rotateBone[0].distance(orgPoint)

    let new_point = this.getPointByOffsetAndAngle(
      orgPoint,
      dl,
      angle + init_angle,
      1
    )
    rotateBone[0] = new_point
    info.boneList[boneIndex] = rotateBone

    info = this.subBoneLinkAge(info, boneIndex)
    boneMoved_angle[boneIndex] = angle
    info.boneMoved_angle = boneMoved_angle
    return info
  }
  //获取旋转后点的坐标
  getPointByOffsetAndAngle(point, offset, angle, dl) {
    return {
      x: point.x + offset * dl * Math.sin((angle * Math.PI) / 180),
      y: point.y + offset * dl * Math.cos((angle * Math.PI) / 180),
    }
  }
  subBoneLinkAge(info, boneIndex) {
    let img_point = info.img_point
    let rotateBone = info.boneList[boneIndex]
    rotateBone = [
      new Victor(rotateBone[0].x, rotateBone[0].y),
      new Victor(rotateBone[1].x, rotateBone[1].y),
      new Victor(rotateBone[2].x, rotateBone[2].y),
    ]
    let initBone_angle = info.initBone_angle

    let boneList = info.boneList
    boneList.forEach((bone, b_idx) => {
      if (b_idx > boneIndex) {
        let pre_bone = boneList[b_idx - 1]
        pre_bone = [
          new Victor(pre_bone[0].x, pre_bone[0].y),
          new Victor(pre_bone[1].x, pre_bone[1].y),
          new Victor(pre_bone[2].x, pre_bone[2].y),
        ]
        bone = [
          new Victor(bone[0].x, bone[0].y),
          new Victor(bone[1].x, bone[1].y),
          new Victor(bone[2].x, bone[2].y),
        ]

        let angle = this.getRotateByMouseMove(pre_bone[1], bone[1], pre_bone[0])

        let new_point_1 = this.replaceRotateBonePoint(
          angle,
          rotateBone,
          bone[1],
          img_point
        )
        bone[1] = new Victor(new_point_1.x, new_point_1.y)

        let new_point_0 = this.replaceRotateBonePoint(
          angle,
          rotateBone,
          bone[0],
          img_point
        )
        bone[0] = new Victor(new_point_0.x, new_point_0.y)

        let init_angle = initBone_angle[b_idx]
        init_angle = this.getTwoPointAngle(bone)
        initBone_angle[b_idx] = init_angle

        boneList[b_idx] = bone
      }
    })
    info.boneList = boneList
    return info
  }
  getRotateByMouseMove(orgP, startP, endP) {
    const lengthAB = Math.sqrt(
      this.diffPow(orgP.x, startP.x) + this.diffPow(orgP.y, startP.y)
    )
    const lengthAC = Math.sqrt(
      this.diffPow(orgP.x, endP.x) + this.diffPow(orgP.y, endP.y)
    )
    const lengthBC = Math.sqrt(
      this.diffPow(startP.x, endP.x) + this.diffPow(startP.y, endP.y)
    )

    if (lengthAB === 0 || lengthAC === 0 || lengthBC === 0) {
      return 0
    }
    const cosA =
      (this.pow(lengthAB) + this.pow(lengthAC) - lengthBC * lengthBC) /
      (2 * lengthAB * lengthAC)
    const angleA = (Math.acos(cosA) * 180) / Math.PI
    if (
      (startP.x - orgP.x) * (endP.y - orgP.y) -
        (endP.x - orgP.x) * (startP.y - orgP.y) >
      0
    ) {
      return -angleA
    }
    return angleA
  }
  pow(x) {
    return x * x
  }
  diffPow(x, y) {
    return (x - y) * (x - y)
  }
  replaceRotateBonePoint(angle, bone, point, img_point) {
    let orgP = new Victor(bone[1].x, bone[1].y)
    orgP = orgP.subtract(img_point)
    point = JSON.stringify(point)
    point = JSON.parse(point)
    let newP = new Victor(point.x, point.y)
    newP = newP.subtract(img_point)
    let relativeP = newP.subtract(orgP)
    let newP_rotate = relativeP.rotate((-angle * Math.PI) / 360)
    let newP_rotate_add = newP_rotate.add(orgP)
    newP_rotate_add.add(img_point)
    return newP_rotate_add
  }
  getTwoPointAngle(bone) {
    bone = [
      new Victor(bone[0].x, bone[0].y),
      new Victor(bone[1].x, bone[1].y),
      new Victor(bone[2].x, bone[2].y),
    ]
    let dl = bone[0].distance(bone[1])
    let temp_point = this.getPointByOffsetAndAngle(bone[1], dl, 0, 1)
    let angle = this.getRotateByMouseMove(bone[1], temp_point, bone[0])
    return angle
  }

  clearCanvas() {
    // this.ctx.fillStyle = "#60000000";
    // this.ctx.fillRect(0, 0, this.width + 10, this.height + 10);
    this.ctx.clearRect(0, 0, this.width + 10, this.height + 10)
  }
}



