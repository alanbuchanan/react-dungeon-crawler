let Main = React.createClass({

   getDefaultProps() {
      return {
         lol: 'lolas'
      }
   },

   getInitialState() {
      let rows = 14;
      let cols = 17;
      let grid = [];
      _.times(rows, (i) => { 
         grid.push([]);
         _.times(cols, () => { grid[i].push(0) })
      });
      let charCoords = [2, 2];

      return {rows, cols, grid, charCoords};
   },

   componentDidMount() {
      let {grid} = this.state;
      grid[2][2] = 1;
      console.log(grid)
      this.setState({grid: grid});
      $(document.body).on('keydown', this.handleKeyDown);
   },

   componentWillUnmount: function() {
      $(document.body).off('keydown', this.handleKeyDown);
   },

   moveMyChar(direction) {

      let {grid, charCoords} = this.state;

      let cc = charCoords.slice(); // for brevity

      let x = cc[0];
      let y = cc[1];

      switch(direction) {
      case 'up':
         if (cc[0] !== 0) {               // guard: not top of table
            this.setNewCharLocation(cc, x, y, 0, direction);
         }
         break;
      case 'down':
         if (cc[0] !== grid.length - 1) { // guard: not bottom of table
            this.setNewCharLocation(cc, x, y, 0, direction);
         }
         break;
      case 'left':
         if (cc[1] !== 0) {               // guard: not extreme left of table
            this.setNewCharLocation(cc, x, y, 1, direction);
         }
         break;
      case 'right':
         if (cc[1] !== grid.length - 1) { // guard: not extreme right of table
            this.setNewCharLocation(cc, x, y, 1, direction);
         }
         break;
      default:
         break;
      }
      charCoords = cc.slice();
      console.log(charCoords)
      this.setState({grid: grid, charCoords: charCoords});
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
      case 38: // up
         this.moveMyChar('up');
         break;
      case 40: // down
         this.moveMyChar('down');
         break;
      case 37: // left
         this.moveMyChar('left');
         break;
      case 39: // right
         this.moveMyChar('right');
         break;
      default: 
         break;
      }
   },

   renderRows(e, i) {

      let {grid, charCoords} = this.state;

      let classToAdd = '';
      

      let tds = e.map((l, j) => {
         if (charCoords[0] == i && charCoords[1] == j) {
            classToAdd = 'charCell';
         } else {
            classToAdd = 'pathCell';
         }
         return (<td className={classToAdd} key={j}>{l}</td>);
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