import Konva from "konva";
import { MenuScreenView } from "./MenuScreenView";

// This page is only for previewing the main menu during development.
const stage = new Konva.Stage({
  container: "menu-preview",
  width: 800,
  height: 600,
});

const layer = new Konva.Layer();
stage.add(layer);

const menu = new MenuScreenView(() => {
  console.log("Start clicked!");
  menu.hide();
});

layer.add(menu.getGroup());
