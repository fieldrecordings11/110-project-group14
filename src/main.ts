import Konva from "konva";
import { MenuScreenView } from "./MenuScreenView";

const stage = new Konva.Stage({
  container: "container",
  width: 800,
  height: 600,
});

const layer = new Konva.Layer();
stage.add(layer);

const menu = new MenuScreenView(() => {
  console.log("Start clicked!");
  menu.hide();
  layer.draw(); // not needed in Konva 8+, harmless otherwise
});

layer.add(menu.getGroup());