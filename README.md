#### Xbone 介绍

这是一个由 Xbone2D 骨骼动画引擎产出的动画运行库

    当前Xbone动画制作场景
    1.HarmonyOS手机系统 XstoryMaker应用内
    2.桌面端（暂无）
    3.网页端（暂无）

##### 简单使用

1.安装

    npm install xbone

2.引入使用

    // OHOS
    import xbone_data from "../../common/json/export_data.json"
    import { Xbone } from "xbone/index.js";
    
    // Web
    import xbone_data from "../assets/data/export_data.json";
    import { Xbone } from "xbone";

    // xbone run
    let option = {
      ctx: ctx, //canvas context
      data: xbone_data, //from XstoryMake app export
      width: width, //canvas width
      height: height, //canvas height
      // A required CallBack
      animeCall: (anime_gridList = []) => {
        if (anime_gridList.length > 0) {
          xbone.reloadImgDraw(anime_gridList);
        } else {
          xbone.reloadImgDraw();
        }
      },
      // input your dev scene: "ohos" or "web"
      clientScene: "ohos",
    };
    xbone = new Xbone(option);

3.示例DEMO
    
    // 临时
    https://gitee.com/sugarnine/a-css-demo/
    or
    https://github.com/412845222/xbone-demo


