const floorCount = document.getElementById("floor-count");
const liftCount = document.getElementById("lift-count");
const enterBtn = document.getElementById("enter");
let table = document.querySelector("#table tbody");
const grass = document.getElementById("grass");
const building = document.querySelector(".building");

let allLifts = null; //gets set to nodeslist with lift-container class
const liftMap = new Map();
let liftPosition = Array.from({ length: Number(liftCount.value) }, () => ({
  position: 0,
  isMoving: false,
  isOperatingDoor: false,
}));
let liftRequests = [];
const liftRequestDirections = {};

const setLiftPosition = () => {
  liftPosition = Array.from({ length: Number(liftCount.value) }, () => ({
    position: 0,
    isMoving: false,
    isOperatingDoor: false,
  }));
};

function initializeLiftMap(allLifts) {
  allLifts.forEach((cell) => {
    const pos = JSON.parse(cell.getAttribute("Id"));
    const key = `${pos[0]},${pos[1]}`;
    liftMap.set(key, cell);
  });
}

// floorCount.addEventListener("keypress", (e) => {
//   if (e.key === "enter") {
//     e.preventDefault();
//     // enterBtn.click();
//     setLiftPosition();
//   }
// });

floorCount.addEventListener("input", (e) => {
  e.preventDefault();

  if (+liftCount.value > 10 || +floorCount.value > 10) {
    building.classList.add("zoom");
  } else {
    building.classList.remove("zoom");
  }
  enterBtn.click();
  // getAllLifts();
  // setLiftPosition();
});

liftCount.addEventListener("input", (e) => {
  e.preventDefault();
  if (+liftCount.value > 10 || +floorCount.value > 10) {
    building.classList.add("zoom");
  }
  enterBtn.click();
  // getAllLifts();
  // setLiftPosition();
});

enterBtn.addEventListener("click", (e) => {
  e.preventDefault();
  createBuilding();
  getAllLifts();
  setLiftPosition();
});

const findClosestLift = (floor) => {
  const arr = liftPosition.map((lp) => {
    return { ...lp, position: lp.position - floor };
  });
  // console.log("diff arr", arr);
  let closest = [arr[0].position, 0]; //closest, index
  let found = false; // flag to find the first non-moving lift

  // console.log("checking ismoving", closest);
  arr.forEach((a, ind) => {
    if (!a.isMoving) {
      if (!found || Math.abs(closest[0]) > Math.abs(a.position)) {
        closest = [a.position, ind];
        found = true;
      }
    }
  });
  // console.log("closest", closest);
  return found ? closest : null;
};

// const findClosestLift = (floor) => {

//   return liftPosition.reduce(
//     (closest, lp, index) => {
//       const diff = Math.abs(lp.position - floor);
//       // Check if the current lift is closer or if it's the same diff but the previous lift was moving
//       if (diff < closest.diff || (diff === closest.diff && closest.isMoving)) {
//         return !lp.isMoving ? { diff, index, isMoving: false } : closest;
//       }
//       return closest;
//     },
//     { diff: Infinity, index: -1 }
//   );
// };

const getMatchingButton = (floor, direction) => {
  var buttons = document.querySelectorAll(".clicked");
  let matchingBtn = null;
  buttons.forEach((button) => {
    let btnDir = button.getAttribute("class");
    if (+button.value === floor && btnDir.split(" ")[0] === direction) {
      matchingBtn = button;
    }
  });
  return matchingBtn;
};

const getAllLifts = () => {
  allLifts = document.querySelectorAll(".door-container");
  initializeLiftMap(allLifts);
};

const animateLiftGoingUp = (
  liftDiv,
  row,
  floor,
  index,
  col,
  matchingButton,
  cell,
  floorWithLift,
  direction
) => {
  return new Promise((resolve) => {
    liftPosition[index].position = row;
    liftPosition[index].isMoving = true;

    if (
      +row === Math.abs(liftPosition[index].position) &&
      +col === index &&
      row !== floor
    ) {
      if (floorWithLift) {
        // liftDiv.classList.add("lift-in-floor");
        liftDiv.classList.add("lift-up");
        setTimeout(() => {
          liftDiv.classList.remove("lift-in-floor");
          liftDiv.classList.remove("lift-up");
          resolve(); // Resolve the promise when the lift-up animation is done
        }, 1000); // Duration of the lift-up animation
      } else {
        liftDiv.classList.add("lift-in-floor");
        liftDiv.classList.add("lift-comes-goes-up");
        setTimeout(() => {
          liftDiv.classList.remove("lift-in-floor");
          liftDiv.classList.remove("lift-comes-goes-up");
          resolve(); // Resolve the promise when the lift-up animation is done
        }, 1500); // Duration of the lift-up animation
      }
    } else {
      resolve(); // Resolve immediately if row === floor
    }
  }).then(() => {
    if (row === floor) {
      liftDiv.classList.add("lift-comes-up");
      liftDiv.classList.add("lift-in-floor");
      setTimeout(() => {
        const doorDiv = liftDiv.children[0];
        matchingButton.classList.remove("clicked");
        doorDiv.classList.add("open-door");
        liftPosition[index].isOperatingDoor = true;
        liftPosition[index].isMoving = false;
        setTimeout(() => {
          liftDiv.classList.remove("lift-comes-up");
          doorDiv.classList.remove("open-door");
          doorDiv.classList.add("close-door");
          setTimeout(() => {
            liftPosition[index].isOperatingDoor = false;
            liftPosition[index].targetFloor = null;
            liftRequestDirections[floor] = liftRequestDirections[floor]
              ? liftRequestDirections[floor].filter((dir) => dir !== direction)
              : [];
          }, 1500);
        }, 2000); // Duration of the door open animation
      }, 1000);
      // console.log(liftRequestDirections);
    }
  });
};

const animateLiftGoingDown = (
  liftDiv,
  row,
  floor,
  index,
  col,
  matchingButton,
  direction
) => {
  return new Promise((resolve) => {
    // console.log(row, col);
    liftPosition[index].position = row;
    liftPosition[index].isMoving = true;

    if (+row === Math.abs(liftPosition[index]["position"]) && +col === index) {
      if (+row !== floor) {
        liftDiv.classList.add("lift-down");
        liftDiv.classList.add("lift-in-floor");
        setTimeout(() => {
          liftDiv.classList.remove("lift-in-floor");
          liftDiv.classList.remove("lift-down");
          resolve(); // Resolve the promise when the lift-down animation is done
        }, 1000); // Duration of the lift-down animation
      } else {
        liftDiv.classList.add("lift-comes-down");
        liftDiv.classList.add("lift-in-floor");
        setTimeout(() => {
          liftDiv.classList.remove("lift-in-floor");
          liftDiv.classList.remove("lift-comes-down");
          resolve(); // Resolve the promise when the lift-down animation is done
        }, 1000); // Duration of the lift-down animation
      }
    } else {
      resolve(); // Resolve immediately if row === floor
    }
  }).then(() => {
    if (row === floor) {
      const doorDiv = liftDiv.children[0];
      matchingButton.classList.remove("clicked");
      doorDiv.classList.add("open-door");
      liftDiv.classList.add("lift-in-floor");
      liftPosition[index].isOperatingDoor = true;
      liftPosition[index].isMoving = false;
      setTimeout(() => {
        doorDiv.classList.remove("open-door");
        doorDiv.classList.add("close-door");
        setTimeout(() => {
          liftPosition[index].isOperatingDoor = false;
          liftRequestDirections[floor] = liftRequestDirections[floor]
            ? liftRequestDirections[floor].filter((dir) => dir !== direction)
            : [];
        }, 1500);
      }, 2000); // Duration of the door open animation
      // console.log(liftRequestDirections);
    }
  });
};

const getLiftToFloor = (floor, direction) => {
  floor = Number(floor);
  const liftOnWay = liftPosition.some(
    (lp) => lp.targetFloor === floor && lp.isMoving
  );
  if (
    !Array.isArray(liftRequestDirections[floor]) ||
    !liftRequestDirections[floor]
    // ||
    // liftRequestDirections[floor].length === 0
  ) {
    // console.log("liftRequestDirections");
    liftRequestDirections[floor] = [];
  }
  // console.log(direction, liftRequestDirections);

  if (!liftRequestDirections[floor].includes(direction)) {
    liftRequestDirections[floor] = [...liftRequestDirections[floor], direction];
    // console.log(liftRequestDirections[floor]);
    liftRequests.push(floor);
    processLiftRequests(direction);
  }

  // else {
  //   processLiftRequests(direction);
  // }
};
// const diff = liftPosition.map((lp) => {
//   return { ...lp, position: lp.position - floor };
// });
// const [closest, index] = closestLift(diff);
// console.log(closest, index);

const processLiftRequests = (direction) => {
  if (liftRequests.length === 0) return;
  const floor = liftRequests[0];
  const availableLifts = liftPosition.filter((lp) => !lp.isMoving);
  // console.log("availableLifts", availableLifts);
  if (availableLifts.length === 0) {
    // All lifts are moving, try again later
    // console.log("unavailable lifts");
    setTimeout(() => processLiftRequests(direction), 1000);
    return;
  }

  // console.log(findClosestLift(floor));

  const [diff, index] = findClosestLift(floor);
  if (liftPosition[index].isOperatingDoor) {
    setTimeout(() => {
      processLiftRequests(direction);
    }, 1000);
    return;
  }

  // console.log("diff,index", diff, index);
  let matchingButton = getMatchingButton(floor, direction); //get the button pressed to style it
  // console.log(matchingButton);
  const liftFloor = liftPosition[index].position;
  const isGoingDown = liftFloor > floor;

  if (diff === 0) {
    const key = `${floor},${index}`;
    const cell = liftMap.get(key);

    if (cell) {
      // console.log("inside", cell);
      const liftDiv = cell.children[0];
      const doorDiv = liftDiv.children[0];
      if (matchingButton) {
        matchingButton.classList.remove("clicked");
      }
      liftPosition[index].isOperatingDoor = true;
      doorDiv.classList.add("open-door");
      setTimeout(() => {
        doorDiv.classList.remove("open-door");
        doorDiv.classList.add("close-door");
        liftPosition[index].isOperatingDoor = false;
      }, 2500);
      doorDiv.classList.remove("close-door");
      liftRequestDirections[floor] = liftRequestDirections[floor].filter(
        (dir) => dir !== direction
      );
    }
  } else if (diff > 0) {
    //lift needs to go down

    for (let row = liftFloor; row >= floor; row--) {
      const key = `${row},${index}`;
      const cell = liftMap.get(key);
      if (cell) {
        const liftDiv = cell.children[0];
        setTimeout(() => {
          animateLiftGoingDown(
            liftDiv,
            row,
            floor,
            index,
            index,
            matchingButton,
            direction
          );
        }, (liftFloor - row) * 1000);
      }
    }
  } else {
    // Lift needs to go up
    // console.log("going up");
    let floorWithLift = true;
    for (let row = liftFloor; row <= floor; row++) {
      const key = `${row},${index}`;
      const cell = liftMap.get(key);
      if (cell) {
        const liftDiv = cell.children[0];
        setTimeout(() => {
          animateLiftGoingUp(
            liftDiv,
            row,
            floor,
            index,
            index,
            matchingButton,
            cell,
            floorWithLift,
            direction
          );
          if (floorWithLift) {
            floorWithLift = false;
          }
        }, (row - liftFloor) * 1000);
      }
    }
  }
  // liftPosition[index].position = floor;
  // liftPosition[index].isMoving = true;
  liftRequests.shift();

  // liftRequestDirections = liftRequestDirections[floor].filter(
  //   (dir) => dir !== direction
  // );

  // if (closest > 0) {
  //   //lift needs to go down
  //   var cellsToAddDownClassTo = allLifts;
  //   const liftFloor = liftPosition[index]["position"];
  //   for (let i = 0; i <= cellsToAddDownClassTo.length - 1; i++) {
  //     let cell = cellsToAddDownClassTo[i];
  //     const pos = cell.getAttribute("Id");
  //     let [row, col] = JSON.parse(pos);
  //     (row = Number(row)), (col = Number(col));
  //     if (col === index && row <= Math.abs(liftFloor) && row >= floor) {
  //       const liftDiv = cell.children[0];
  //       setTimeout(() => {
  //         animateLiftGoingDown(liftDiv, row, floor, index, col, matchingButton);
  //       }, Math.abs(row - liftFloor) * 1000);
  //     }
  //   }
  // } else if (closest < 0) {
  //   //lift needs to go up
  //   //closest is the no. of rows I have to move & index is the column I have to move in
  //   var cellsToAddUPClassTo = allLifts;
  //   let floorWithLift = true;
  //   for (let i = cellsToAddUPClassTo.length - 1; i >= 0; i--) {
  //     let cell = cellsToAddUPClassTo[i];
  //     const pos = cell.getAttribute("Id");
  //     let [row, col] = JSON.parse(pos);

  //     (row = Number(row)), (col = Number(col));

  //     if (
  //       col === index &&
  //       row <= floor &&
  //       row >= Math.abs(liftPosition[index]["position"])
  //     ) {
  //       const liftDiv = cell.children[0];

  //       setTimeout(() => {
  //         animateLiftGoingUp(
  //           liftDiv,
  //           row,
  //           floor,
  //           index,
  //           col,
  //           matchingButton,
  //           cell,
  //           floorWithLift
  //         );
  //         if (floorWithLift) {
  //           floorWithLift = false;
  //         }
  //       }, row * 1000);
  //     }
  //   }
  // }
  // if (closest === 0) {
  //   var cellsToAddOpenDoorTo = allLifts;
  //   cellsToAddOpenDoorTo.forEach((cell, i) => {
  //     const pos = cell.getAttribute("Id");
  //     const [row, col] = JSON.parse(pos);
  //     if (+col === Math.abs(index) && row === floor) {
  //       const liftDiv = cell.children[0];
  //       const doorDiv = liftDiv.children[0];

  //       if (matchingButton) {
  //         matchingButton.classList.remove("clicked");
  //       }
  //       doorDiv.classList.add("open-door");
  //       setTimeout(() => {
  //         doorDiv.classList.remove("open-door");
  //         doorDiv.classList.add("close-door");
  //       }, 2500);
  //       doorDiv.classList.remove("close-door");
  //     }
  //   });
  // }
};

const createUpDownButton = (tr, i) => {
  let td = document.createElement("td");
  td.setAttribute("class", "buttonCol");
  let floorNumber = document.createElement("p");
  floorNumber.setAttribute("class", "floor-number");
  floorNumber.innerHTML = i;
  td.appendChild(floorNumber);

  if (i < floorCount.value - 1 && liftCount.value > 0) {
    let up = document.createElement("button");
    up.innerHTML =
      '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'><svg enable-background="new 0 0 32 32" height="16px" id="Layer_1" version="1.1" viewBox="0 0 32 32" width="16px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M18.221,7.206l9.585,9.585c0.879,0.879,0.879,2.317,0,3.195l-0.8,0.801c-0.877,0.878-2.316,0.878-3.194,0  l-7.315-7.315l-7.315,7.315c-0.878,0.878-2.317,0.878-3.194,0l-0.8-0.801c-0.879-0.878-0.879-2.316,0-3.195l9.587-9.585  c0.471-0.472,1.103-0.682,1.723-0.647C17.115,6.524,17.748,6.734,18.221,7.206z" fill="#fff"/></svg>';
    up.className = "up";
    up.value = i;
    td.append(up);
    up.addEventListener("click", () => {
      up.classList.add("clicked");
      getLiftToFloor(up.value, "up");
    });
  }
  if (i > 0 && liftCount.value > 0) {
    let down = document.createElement("button");
    down.innerHTML =
      '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'><svg enable-background="new 0 0 32 32" height="16px" id="Layer_1" version="1.1" viewBox="0 0 32 32" width="16px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M14.77,23.795L5.185,14.21c-0.879-0.879-0.879-2.317,0-3.195l0.8-0.801c0.877-0.878,2.316-0.878,3.194,0  l7.315,7.315l7.316-7.315c0.878-0.878,2.317-0.878,3.194,0l0.8,0.801c0.879,0.878,0.879,2.316,0,3.195l-9.587,9.585  c-0.471,0.472-1.104,0.682-1.723,0.647C15.875,24.477,15.243,24.267,14.77,23.795z" fill="#fff"/></svg>';
    down.className = "down";
    down.value = i;
    td.append(down);
    down.addEventListener("click", () => {
      down.classList.add("clicked");
      getLiftToFloor(down.value, "down");
    });
  }
  tr.append(td);
};

const createBuilding = () => {
  //deletes previous building
  if (table.hasChildNodes()) {
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
  }
  //creates new building
  for (let i = 0; i < floorCount.value; i++) {
    table = document.querySelector("#table tbody");
    //row for floor
    var tr = document.createElement("tr");

    tr.setAttribute("class", "floor");
    //updown arrows for each row
    createUpDownButton(tr, i);

    for (let j = 0; j < liftCount.value; j++) {
      var td = document.createElement("td");
      td.setAttribute("class", "door-container");
      td.setAttribute("id", `[${i},${j}]`);

      var lift = document.createElement("div"); //the side doors
      var liftDoors = document.createElement("div");
      lift.setAttribute("class", "lift");
      liftDoors.setAttribute("class", "doors"); //the white line
      lift.appendChild(liftDoors);
      if (i === 0) {
        lift.classList.add("lift-in-floor");
      }
      td.appendChild(lift);
      tr.appendChild(td);
    }
    table.insertBefore(tr, table.firstChild);
    //border row
    var borderTr = document.createElement("tr");
    let borderTd = borderTr.insertCell();
    borderTd.setAttribute("class", "border");

    table.insertBefore(borderTr, table.firstChild);
  }
  grass.scrollIntoView(grass);
};
