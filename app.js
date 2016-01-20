let Main = React.createClass({

   getInitialState() {
      let cols = 25;
      let rows = 35;
      let grid = [];


      let charCoords = [Math.floor(rows / 2), Math.floor(cols / 2)];

      let generatedCells = {
         weapons: [],
         healths: [],
         enemies: [],
         blocks: [],
         paths: [],
         goal: []
      };

      _.times(rows, (i) => { 
         grid.push([]);
         _.times(cols, (j) => { 
            grid[i].push(' ');
            generatedCells.blocks.push(`${i}_${j}`)
         });
      });

      return {rows, cols, grid, charCoords, generatedCells};
   },

   componentDidMount() {
      $(document.body).on('keydown', this.handleKeyDown);
      let {generatedCells, charCoords, cols, rows} = this.state;
      let {weapons, healths, enemies, blocks, paths, goal} = generatedCells;
   

      // weapons.push(
      //    `${_.random(9, 10)}_${_.random(9, 10)}`
      // );
      // healths.push(
      //    `${_.random(15, 20)}_${_.random(15, 13)}`,
      //    `${_.random(7, 9)}_${_.random(7, 9)}`,
      //    `${_.random(21, 23)}_${_.random(21, 24)}`
      // );
      // enemies.push(
      //    '10_9',
      //    '3_6',
      //    '5_4'
      // );

      // safe Y = cols - 4
      // safe x = rows - 3
      // blocks.splice(blocks.indexOf(healths[1]), 1)
      goal = '6_15'; // this is NOT working, it's being set from getInitialState

      this.setState({generatedCells: generatedCells})
      
      // set the map's playable path
      this.setPathsInMap();
   },

   setPathsInMap() {
      let {generatedCells, charCoords, cols, rows} = this.state;
      let {weapons, healths, enemies, paths, blocks, goal} = generatedCells;

      let myCoords = `${charCoords[0]}_${charCoords[1]}`;
      
      let currentCell = myCoords;
      let homeCell = myCoords;

      let getRandomCoords = (a, b) => {
         return `${_.random(a - 1, a + 1)}_${_.random(b - 1, b + 1)}`;
      }

      let randomCoords = [
         getRandomCoords(Math.floor(cols / 10), Math.floor(rows / 10)), //top left
         getRandomCoords(Math.floor(cols / 10), cols - 6), // top right
         getRandomCoords(rows - 6, Math.floor(cols / 10)), // bottom left
         getRandomCoords(rows - 6, cols - 6), // bottom right
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 1
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 2
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 3
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 4
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 5
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 6
      ];

      console.log('topleft:', randomCoords[0])
      console.log('topright:', randomCoords[1])
      console.log('bottomleft:', randomCoords[2])
      console.log('bottomright:', randomCoords[3])
      console.log('random 1:', randomCoords[4])
      console.log('random 2:', randomCoords[5])
      console.log('random 3:', randomCoords[6])


      let sampleAndRemove = () => {
         if(randomCoords.length == 0) {
            console.log('ERROR: No items in coords left!')
            return;
         }
         let sample = _.sample(randomCoords)
         console.log(sample)
         console.log('index:', randomCoords.indexOf(sample))
         randomCoords.splice(randomCoords.indexOf(sample), 1);
         return sample;
      }

      // could implement _.shuffle() here

      weapons.push(
         sampleAndRemove()
      );
         
      healths.push(
         sampleAndRemove(),
         sampleAndRemove(),
         sampleAndRemove(),
      );

      goal.push(sampleAndRemove());

      enemies.push(
         '10_9',
         '3_6',
         '5_4'
      );

      let remainingTargets = [
         weapons[0], 
         healths[0], 
         healths[1], 
         healths[2], 
         goal[0],
         sampleAndRemove(),
         sampleAndRemove(),
         sampleAndRemove(),
         sampleAndRemove(),
         sampleAndRemove(),
      ];

      // THINGS TO BEAR IN MIND.
      // When there is an item on the map, it's moveable to as well.
      // Enemies not yet implemented.
      // Where should player begin map from.
      // Viewport.

      remainingTargets.forEach((e,i) => {

         currentCell = homeCell;
         let targetX = parseInt(e.split('_')[0]);
         let targetY = parseInt(e.split('_')[1]);

         //carvePath towards targets
         let count = 0
         while(currentCell != e){

            let currentX = parseInt(currentCell.split('_')[0]);
            let currentY = parseInt(currentCell.split('_')[1]);

            // console.log('current:', currentX, currentY)

            if (count == 100) { console.log('broke'); break; };

            this.carvePath(paths, blocks, currentCell);

            // create jagged corridors and rooms with this:
            let n = _.random(0, 1);
            if(n == 1){
               if (targetX > currentX) {
                  currentX++;
               } else if (targetX < currentX) {
                  currentX--;
               } else if(targetY > currentY) {
                  currentY++;
               } else if (targetY < currentY) {
                  currentY--;
               }
            } else {
               if(targetY > currentY) {
                  currentY++;
               } else if (targetY < currentY) {
                  currentY--;
               } else if (targetX > currentX) {
                  currentX++;
               } else if (targetX < currentX) {
                  currentX--;
               }
            }


            currentCell = currentX + '_' + currentY;
            count++; // increment for while loop

            // console.log('current after:', currentX, currentY)
         }
         this.carvePath(paths, blocks, currentCell); //if not called again here, it won't carve the very last cell

      })
   },

   carvePath(paths, blocks, coords) {

      let possibleToCarve = () => {
         return true;
      };

      if(possibleToCarve){
         paths.push(coords);
         blocks.splice(blocks.indexOf(coords), 1);
      }
      
   },

   componentWillUnmount() {
      $(document.body).off('keydown', this.handleKeyDown);
   },

   moveMyChar(direction) { // changes state

      let {grid, charCoords, cols, generatedCells} = this.state;

      let cc = charCoords.slice(); // for brevity

      let x = cc[0];
      let y = cc[1];

      console.log('generatedCells.blocks:', generatedCells.blocks)

      let targetCellIsAvailable = (x, y) => {
         console.log('generatedCells.blocks.indexOf(x_y):', generatedCells.blocks.indexOf(`${x}_${y}`))

         return generatedCells.blocks.indexOf(`${x}_${y}`) == -1;
      };

      switch(direction) {
      case 'up':
         if (x !== 0 && targetCellIsAvailable(x - 1, y)) {               // guard: not top of table & moveable to
            this.setNewCharLocation(cc, x, y, 0, direction);
         }
         break;
      case 'down':
         if (x !== grid.length - 1 && targetCellIsAvailable(x + 1, y)) { // guard: not bottom of table & moveable to
            this.setNewCharLocation(cc, x, y, 0, direction);
         }
         break;
      case 'left':
         if (y !== 0 && targetCellIsAvailable(x, y - 1)) {               // guard: not extreme left of table & moveable to
            this.setNewCharLocation(cc, x, y, 1, direction);
         }
         break;
      case 'right':
         if (y !== cols - 1 && targetCellIsAvailable(x, y + 1)) {       // guard: not extreme right of table & moveable to
            this.setNewCharLocation(cc, x, y, 1, direction);
         }
         break;
      default:
         break;
      }

      charCoords = cc.slice();
      console.log('charCoords after move:', charCoords)
      let{weapons, healths} = generatedCells;
      this.removeFromItemsIfNommed(weapons, charCoords, 'w');
      this.removeFromItemsIfNommed(healths, charCoords, 'h');

      this.setState({
         grid: grid,
         charCoords: charCoords,
         generatedCells: generatedCells
      });
   },

   removeFromItemsIfNommed(arr, charCoords, name) {
      arr.forEach((e, i) => {
         if(e.split('_')[0] == charCoords[0] && e.split('_')[1] == charCoords[1]){ // char is on weapon cell
            arr.splice(i, 1) // delete from arr
            // log for debugging:
            switch(name) {
            case 'w': console.log('nommed weapon'); break;
            case 'h': console.log('nommed health'); break;
            }
         }
      });
      
   },

   setNewCharLocation(cc, x, y, indexToChange, direction) {
      let {grid} = this.state;
      grid[x][y] = 0; // replace char with blank space

      // set new location based on direction
      if (direction == 'up' || direction == 'left') {
         --cc[indexToChange]; 
      } else {
         ++cc[indexToChange];
      }
      // reassign x or y so that the subsequent reassignment line is clean
      if (direction == 'up' || direction == 'down') {
         x = cc[indexToChange];
      } else {
         y = cc[indexToChange];
      }
      


      grid[x][y] = 1;
   },

   handleKeyDown(e){
      switch(e.keyCode) {
      case 38:this.moveMyChar('up');break;
      case 40:this.moveMyChar('down');break;
      case 37:this.moveMyChar('left');break;
      case 39:this.moveMyChar('right');break;
      default: break;
      }
   },

   renderRows(e, i) {
      let {grid, charCoords, generatedCells} = this.state;
      let {weapons, healths, blocks, paths, goal} = generatedCells;

      let classToAdd = '';

      let tds = e.map((l, j) => {

         if (charCoords[0] == i && charCoords[1] == j) {
            classToAdd = 'charCell';
         } else if(weapons.indexOf(`${i}_${j}`) !== -1) {
            classToAdd = 'weaponCell'; // render a weapon cell
         } else if(healths.indexOf(`${i}_${j}`) !== -1) {
            classToAdd = 'healthCell'; // render a health cell
         } else if(goal == `${i}_${j}`) {
            classToAdd = 'goalCell'; // render the goal cell
         } else if(goal == `${i}_${j}`) {
            classToAdd = 'enemyCell'; // render the enemy cell
         } else if(blocks.indexOf(`${i}_${j}`) !== -1) {
            classToAdd = 'blockCell'; // render a block cell
         } else if(paths.indexOf(`${i}_${j}`) !== -1) {
            classToAdd = 'pathCell'; // render a path cell
         }
         return (<td className={classToAdd} key={j}></td>);
      })
      return <tr key={i}>{tds}</tr>
   },

   renderTable() {
      let {grid} = this.state;
      return grid.map((e, i) => {
         return this.renderRows(e, i)
      });
   },

   render(){
      let loading = this.state.grid.length === 0;
      return (
         <table>
            <tbody>
               {loading ? <Loading /> : this.renderTable()}
            </tbody>
         </table>

      );
   }
});

let Loading = () => (<div></div>);

ReactDOM.render(<Main />, document.getElementById('root'));
