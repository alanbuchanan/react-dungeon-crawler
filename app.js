// THINGS TO BEAR IN MIND.
// Enemies not yet implemented.
// Boss.
// Viewport.

// Problematic bottom line of table.
// Goal sometimes renders in front of other stuff in corridor (other stuff is unreachable).
// Sometimes an enemy spawns on the character

let Main = React.createClass({

   getInitialState() {
      let cols = 25;
      let rows = 25;
      let grid = [];
      let char = {
         health: 100,
         xp: 0,
         weapon: 'rusty dagger'
      };

      let level = 1;

      let charCoords = [Math.floor(rows / 2), Math.floor(cols / 2)];

      let generatedCells = {
         weapons: [],
         healths: [],
         enemies: [],
         blocks: [],
         paths: [],
         goal: [],
      };

      _.times(rows, (i) => { 
         grid.push([]);
         _.times(cols, (j) => { 
            grid[i].push(' ');
            generatedCells.blocks.push(`${i}_${j}`)
         });
      });

      return {rows, cols, grid, charCoords, generatedCells, char, level};
   },

   componentDidMount() {
      $(document.body).on('keydown', this.handleKeyDown);
      let {generatedCells, charCoords, cols, rows} = this.state;
      let {weapons, healths, enemies, blocks, paths, goal} = generatedCells;

      this.forceUpdate();
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
         return `${_.random(a, a + 1)}_${_.random(b, b + 1)}`;
      }

      let cornerCoords = [
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
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 6
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 6
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 6
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 6
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 6
         getRandomCoords(_.random(0, rows - 4), _.random(0, cols - 4)), // random 6
      ];

      console.log('topleft:', cornerCoords[0])
      console.log('topright:', cornerCoords[1])
      console.log('bottomleft:', cornerCoords[2])
      console.log('bottomright:', cornerCoords[3])
      console.log('random 1:', cornerCoords[4])
      console.log('random 2:', cornerCoords[5])
      console.log('random 3:', cornerCoords[6])


      let getNSamplesAndRemove = (num) => {
         let res = [];

         if(cornerCoords.length == 0) {
            console.log('ERROR: No items in coords left!')
            return;
         }

         //TODO: If none left in cornerCoords, just generate new random coords here

         _.times(num, () => {
            let sample = _.sample(cornerCoords)
            console.log(sample)
            console.log('index:', cornerCoords.indexOf(sample))
            cornerCoords.splice(cornerCoords.indexOf(sample), 1);
            res.push(sample);
         });

         return res;
      }

      // could implement _.shuffle() here

      weapons.push(...getNSamplesAndRemove(1));
      healths.push(...getNSamplesAndRemove(3));
      goal.push(...getNSamplesAndRemove(1));

      let itemsToRender = _.union(weapons, healths, enemies, goal)

      let remainingTargets = [];
      remainingTargets.push(
         ...itemsToRender, // render weapons, healths, enemies, goal
         ...getNSamplesAndRemove(Math.floor(cols / 5) - 1) // render some random points
      );

      console.log('WEAPONS:', weapons)
      console.log('HEALTHS:', healths)
      console.log('REMAINING:', remainingTargets)

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
            count++; // increment while loop

            // console.log('current after:', currentX, currentY)
         }
         this.carvePath(paths, blocks, currentCell); //if not called again here, it won't carve the very last cell
         
      })// end foreach

      let renderNEnemies = (num) => {
         
         console.log('charCoords:', charCoords)

         let res = [];

         let shuffledPaths = paths.slice();

         shuffledPaths = _.shuffle(shuffledPaths);

         shuffledPaths.forEach((e, i) => {
            if(_.includes(weapons, e) ||
               _.includes(healths, e) ||
               _.includes(goal, e) ||
               e == `${charCoords[0]}_${charCoords[1]}`){
               console.log(e)
               shuffledPaths.splice(i, 1);
            }
         })
         
         _.times(num, (i) => {
            res.push({coords: shuffledPaths[i], health: 10})
         })

         return res;
      }
      
      // enemies must be rendered after the path has been rendered!
      enemies.push(...renderNEnemies(4))

      this.setState({generatedCells: generatedCells})
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

   reInit() {
      let cols = 25;
      let rows = 25;
      let grid = [];
      let char = {
         health: 100,
         xp: 0,
         weapon: 'rusty dagger'
      };

      let level = 2;

      let charCoords = [Math.floor(rows / 2), Math.floor(cols / 2)];

      let generatedCells = {
         weapons: [],
         healths: [],
         enemies: [],
         blocks: [],
         paths: [],
         goal: [],
      };

      _.times(rows, (i) => { 
         grid.push([]);
         _.times(cols, (j) => { 
            grid[i].push(' ');
            generatedCells.blocks.push(`${i}_${j}`)
         });
      });

      this.setState({
         rows: rows,
         cols: cols,
         grid: grid,
         char: char,
         level: level,
         charCoords: charCoords,
         generatedCells: generatedCells,
      })
   },

   attackEnemy(x, y){
      let {char, generatedCells} = this.state;
      let {enemies} = generatedCells;
      
      // identify the enemy from the state
      let enemyToDamage = _.find(enemies, (e) => e.coords == `${x}_${y}`);
      
      // char attacked enemy
      enemyToDamage.health -= 4;
      char.xp += 150;

      // check if enemy died
      if(enemyToDamage.health <= 0){
         enemies.splice(enemies.indexOf(enemyToDamage), 1)
      }

      // enemy attacked char
      char.health -= 30;
      this.setState({char: char})

      // check if char died
      if(char.health <= 0){
         alert('You died!')
         // died. re-render!
         this.reInit(); //pass args here
         this.setPathsInMap();
         
         // This needs to be called otherwise it doesn't update. I DON'T KNOW WHY! I tried setting a method that simply re-sets state but it failed.
         // console says 'charCoords is not defined'. yet if i remove it it doesn't re-render. WTF!
         this.setState({
            charCoords: charCoords,
            generatedCells: generatedCells
         });        
      }
   },

   moveMyChar(direction) { // changes state

      let {grid, charCoords, cols, generatedCells, char} = this.state;
      let {weapons, healths, goal, enemies, blocks} = generatedCells;//put this at top of method
      let enemyCoords = [];

      generatedCells.enemies.forEach((e, i) => {
         enemyCoords.push(e.coords)
      });

      let cc = charCoords.slice(); // for brevity

      let x = cc[0];
      let y = cc[1];

      let targetCellIsAvailable = (x, y) => {
         return !_.includes(blocks, `${x}_${y}`) &&
         !_.includes(enemyCoords,`${x}_${y}`);
      };

      let targetCellIsEnemy = (x, y) => {
         return _.includes(enemyCoords, `${x}_${y}`);
      };

      switch(direction) {
      case 'up':
         if(targetCellIsEnemy(x - 1, y)){
            this.attackEnemy(x - 1, y);
         }
         else if (x !== 0 && targetCellIsAvailable(x - 1, y)) {               // guard: not top of table & moveable to
            this.setNewCharLocation(cc, x, y, 0, direction);
         }
         break;
      case 'down':
         if(targetCellIsEnemy(x + 1, y)){
            this.attackEnemy(x + 1, y);
         }
         else if (x !== grid.length - 1 && targetCellIsAvailable(x + 1, y)) { // guard: not bottom of table & moveable to
            this.setNewCharLocation(cc, x, y, 0, direction);
         }
         break;
      case 'left':
         if(targetCellIsEnemy(x, y - 1)){
            this.attackEnemy(x, y - 1);
         }
         if (y !== 0 && targetCellIsAvailable(x, y - 1)) {               // guard: not extreme left of table & moveable to
            this.setNewCharLocation(cc, x, y, 1, direction);
         }
         break;
      case 'right':
         if(targetCellIsEnemy(x, y + 1)){
            this.attackEnemy(x, y + 1);
         }
         if (y !== cols - 1 && targetCellIsAvailable(x, y + 1)) {       // guard: not extreme right of table & moveable to
            this.setNewCharLocation(cc, x, y, 1, direction);
         }
         break;
      default:
         break;
      }

      if(`${cc[0]}_${cc[1]}` == generatedCells.goal[0]){
         // goal reached. re-render!
         this.reInit(); //pass args here
         this.setPathsInMap();
         this.forceUpdate();
         
      } else {

         charCoords = cc.slice();
         console.log('charCoords after move:', charCoords)
         this.removeFromItemsIfNommed(weapons, charCoords, 'w');
         this.removeFromItemsIfNommed(healths, charCoords, 'h');
         this.removeFromItemsIfNommed(enemyCoords, charCoords, 'e');
         
         // This is what's called when dead, but if this is out of the else, it makes the port fail!
         this.setState({
            grid: grid,
            charCoords: charCoords,
            generatedCells: generatedCells
         });
      }
   },

   removeFromItemsIfNommed(arr, charCoords, name) {
      
      let {char} = this.state;

      arr.forEach((e, i) => {
         if(e.split('_')[0] == charCoords[0] && e.split('_')[1] == charCoords[1]){ // char is on weapon cell
            // log for debugging:
            switch(name) {
            case 'w': 
               console.log('nommed weapon');
               arr.splice(i, 1) // delete from arr
               char.weapon = 'mace'
               this.setState({char: char})
               break;
            case 'h': 
               console.log('nommed health');
               arr.splice(i, 1) // delete from arr
               char.health += 10;
               this.setState({char: char})
               break;
            case 'e': 
               // arr.splice(arr.indexOf(i), 1) // delete from arr
               console.log('nommed enemy');
               char.xp += 100;
               this.setState({char: char})
               //TODO: deal with enemy encounter. currently gets nommed but doesnt disappear
               break;
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
      let {weapons, healths, blocks, paths, enemies, goal} = generatedCells;
      let enemyCoords = [];

      generatedCells.enemies.forEach((e, i) => {
         enemyCoords.push(e.coords)
      })
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
         } else if(enemyCoords.indexOf(`${i}_${j}`) !== -1) {
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
         <div>
            <table>
               <tbody>
                  {loading ? <Loading /> : this.renderTable()}
               </tbody>
            </table>
            <UserInterface state={this.state}/>
         </div>

      );
   }
});

let UserInterface = React.createClass({
   render(){
      let {char, level} = this.props.state
      console.log(char)
      return (
         <div>
            <span>Level: {level}</span>
            <span> . . . . . . . . . </span>
            <span>Health: {char.health}</span>
            <span> . . . . . . . . . </span>
            <span>XP: {char.xp}</span>
            <span> . . . . . . . . . </span>
            <span>Weapon: {char.weapon}</span>
         </div>
      )
   }
})

let Loading = () => (<div>Loading...</div>);

ReactDOM.render(<Main />, document.getElementById('root'));
