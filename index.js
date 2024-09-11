const floorCount = document.getElementById("floor-count");
const liftCount = document.getElementById("lift-count");
const enterBtn = document.getElementById("enter");
let table = document.querySelector("#table tbody");
let speed = document.getElementById("speed");
const grass = document.getElementById("grass");
const building = document.querySelector(".building");
let liftSpeed = speed;

let liftPosition = Array(Number(liftCount.value)).fill(0);
const setLiftPosition = () => {
  liftPosition = Array(Number(liftCount.value)).fill(0);
};

speed.addEventListener("change", (e) => {
  liftSpeed = e.target.value;
  console.log(liftSpeed);
});

floorCount.addEventListener("keypress", (e) => {
  if (e.key === "enter") {
    e.preventDefault();
    enterBtn.click();
    setLiftPosition();
  }
});
floorCount.addEventListener("change", (e) => {
  e.preventDefault();
  if (+liftCount.value > 10 || +floorCount.value > 10) {
    building.classList.add("zoom");
  } else {
    building.classList.remove("zoom");
  }
  enterBtn.click();
  setLiftPosition();
});

liftCount.addEventListener("change", (e) => {
  e.preventDefault();
  if (+liftCount.value > 10 || +floorCount.value > 10) {
    building.classList.add("zoom");
  }
  enterBtn.click();
  setLiftPosition();
});
enterBtn.addEventListener("click", (e) => {
  e.preventDefault();
  createBuilding();
  setLiftPosition();
});

const closestLift = (arr) => {
  let closest = [arr[0], 0]; //closest, index
  arr.forEach((a, ind) => {
    closest = Math.abs(closest[0]) > Math.abs(a) ? [a, ind] : closest;
  });
  return closest;
};

const animateLiftGoingUp = (
  liftDiv,
  row,
  floor,
  index,
  col,
  matchingButton,
  cell
) => {
  return new Promise((resolve) => {
    liftPosition[index] = row;
    if (+row === Math.abs(liftPosition[index]) && +col === index) {
      liftDiv.classList.add("lift-in-floor");
      liftDiv.classList.add("lift-up");
      setTimeout(() => {
        liftDiv.classList.remove("lift-in-floor");
        liftDiv.classList.remove("lift-up");
        resolve(); // Resolve the promise when the lift-up animation is done
      }, 1000); // Duration of the lift-up animation
    } else {
      resolve(); // Resolve immediately if row === floor
    }
  }).then(() => {
    if (row === floor) {
      const doorDiv = liftDiv.children[0];
      matchingButton.classList.remove("clicked");
      liftDiv.classList.add("lift-in-floor");
      doorDiv.classList.add("open-door");
      setTimeout(() => {
        doorDiv.classList.remove("open-door");
        doorDiv.classList.add("close-door");
      }, 2000); // Duration of the door open animation
    }
  });
};

const animateLiftGoingDown = (
  liftDiv,
  row,
  floor,
  index,
  col,
  matchingButton
) => {
  return new Promise((resolve) => {
    console.log(row, col);
    liftPosition[index] = row;
    if (+row === Math.abs(liftPosition[index]) && +col === index) {
      liftDiv.classList.add("lift-down");
      setTimeout(() => {
        liftDiv.classList.remove("lift-in-floor");
        liftDiv.classList.remove("lift-down");
        resolve(); // Resolve the promise when the lift-down animation is done
      }, 1000); // Duration of the lift-down animation
    } else {
      resolve(); // Resolve immediately if row === floor
    }
  }).then(() => {
    if (row === floor) {
      const doorDiv = liftDiv.children[0];
      matchingButton.classList.remove("clicked");
      doorDiv.classList.add("open-door");
      liftDiv.classList.add("lift-in-floor");
      setTimeout(() => {
        doorDiv.classList.remove("open-door");
        doorDiv.classList.add("close-door");
      }, 2000); // Duration of the door open animation
    }
  });
};

const getLiftToFloor = (floor) => {
  floor = Number(floor);
  const diff = liftPosition.map((pos) => pos - floor);
  console.log("diff", diff);
  console.log("liftposition", liftPosition);
  const [closest, index] = closestLift(diff);
  console.log(closest, index);
  if (closest > 0) {
    //add class that sends lift down based on key of td
    var cellsToAddDownClassTo = document.querySelectorAll(".door-container");
    var buttons = document.querySelectorAll(".clicked");
    let matchingButton = null;
    buttons.forEach((button) => {
      if (+button.value === floor) {
        matchingButton = button;
      }
    });
    const liftFloor = liftPosition[index];
    for (let i = 0; i <= cellsToAddDownClassTo.length - 1; i++) {
      let cell = cellsToAddDownClassTo[i];
      const pos = cell.getAttribute("Id");
      let [row, col] = JSON.parse(pos);
      (row = Number(row)), (col = Number(col));
      if (
        col === index &&
        row <= Math.abs(liftPosition[index]) &&
        row >= floor
      ) {
        const liftDiv = cell.children[0];
        setTimeout(() => {
          animateLiftGoingDown(liftDiv, row, floor, index, col, matchingButton);
        }, Math.abs(row - liftFloor) * 1000);
      }
    }
  } else if (closest < 0) {
    //add class to send lift up based on key of td
    //closest is the no. of rows I have to move & index is the column I have to move in

    var cellsToAddUPClassTo = document.querySelectorAll(".door-container");
    var buttons = document.querySelectorAll(".clicked");
    let matchingButton = null;
    buttons.forEach((button) => {
      if (+button.value === floor) {
        matchingButton = button;
      }
    });
    for (let i = cellsToAddUPClassTo.length - 1; i >= 0; i--) {
      let cell = cellsToAddUPClassTo[i];
      const pos = cell.getAttribute("Id");
      let [row, col] = JSON.parse(pos);

      (row = Number(row)), (col = Number(col));
      if (
        col === index &&
        row <= floor &&
        row >= Math.abs(liftPosition[index])
      ) {
        const liftDiv = cell.children[0];
        setTimeout(() => {
          animateLiftGoingUp(
            liftDiv,
            row,
            floor,
            index,
            col,
            matchingButton,
            cell
          );
        }, row * 1000);
      }
    }
  }
  if (closest === 0) {
    var cellsToAddOpenDoorTo = document.querySelectorAll(".door-container");
    var buttons = document.querySelectorAll(".clicked");
    let matchingButton = null;
    buttons.forEach((button) => {
      console.log(typeof button.value);
      if (+button.value === floor) {
        matchingButton = button;
      }
    });
    cellsToAddOpenDoorTo.forEach((cell, i) => {
      const pos = cell.getAttribute("Id");
      const [row, col] = JSON.parse(pos);
      if (+col === Math.abs(index) && row === floor) {
        const liftDiv = cell.children[0];
        const doorDiv = liftDiv.children[0];

        if (matchingButton) {
          matchingButton.classList.remove("clicked");
        }
        doorDiv.classList.add("open-door");
        setTimeout(() => {
          doorDiv.classList.remove("open-door");
          doorDiv.classList.add("close-door");
        }, 2500);
        doorDiv.classList.remove("close-door");
      }
    });
  }
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
      getLiftToFloor(up.value);
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
      getLiftToFloor(down.value);
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
