import { useState } from "react";

/**
 * Native drag and drop for a row of cards. Returns [state, propsFor(index)].
 * onMove(from, to) is called on drop. Touch screens keep the Move left/right buttons.
 */
export default function useCardDrag(onMove) {
  const [drag, setDrag] = useState({ from: null, over: null });
  const end = () => setDrag({ from: null, over: null });

  const propsFor = (index) => ({
    draggable: true,
    onDragStart: (e) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
      setDrag({ from: index, over: index });
    },
    onDragEnter: (e) => {
      e.preventDefault();
      setDrag((d) => (d.from === null || d.over === index ? d : { ...d, over: index }));
    },
    onDragOver: (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDrop: (e) => {
      e.preventDefault();
      const from = drag.from ?? Number(e.dataTransfer.getData("text/plain"));
      if (Number.isInteger(from) && from !== index) onMove(from, index);
      end();
    },
    onDragEnd: end,
  });

  return [drag, propsFor];
}
