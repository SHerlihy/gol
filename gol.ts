const liveRules = (nCount: number, curLive: number): number => {
        if (nCount<2){
            return 0
        }

        if (nCount > 3){
            return 0
        }

        if (nCount === 3){
            return 1
        }

        return curLive
    }

class Cell {
    public curLive;
    public nextLive;
    public countNeighbours: ()=>number;

    constructor(curLive: number, countNeighbours: ()=>number){
        this.curLive = curLive;
        this.nextLive = 0;
        this.countNeighbours = countNeighbours;
    }

    public evalLive(){
        const nCount = this.countNeighbours()

        this.nextLive = liveRules(nCount, this.curLive)
    }

    public update(){
        this.curLive = this.nextLive
    }
}

class World {
    public cells: Array<Array<Cell>>;

    private countNeighbours(yMods: number[], xMods: number[], y: number, x: number){
        let count = 0;

        yMods.forEach((yMod)=>{
            xMods.forEach((xMod)=>{
                if (yMod === 0 && xMod === 0){
                    return
                }

                const cell = this.cells[y+yMod][x+xMod]

                count+=cell.curLive
            })
        })

        return count
    }

    private countNeighboursM(y: number, x: number){
        return this.countNeighbours([-1,0,+1], [-1,0,+1], y, x)
    }

    private countNeighboursT(y: number, x: number){
        let count = 0

        const xMod = [-1,0,+1]

        count+=this.countNeighbours([0,+1], xMod, y, x)

        const lastRowIdx = this.cells.length-1
        count+=xMod.reduce((acc, cur)=>{
            acc+=this.cells[lastRowIdx][x+cur].curLive
            return acc
        }, 0)

        return count
    }

    private countNeighboursB(y: number, x: number){
        let count = 0

        const xMod = [-1,0,+1]

        count+=this.countNeighbours([-1,0], xMod, y, x)

        count+=xMod.reduce((acc, cur)=>{
            acc+=this.cells[0][x+cur].curLive
            return acc
        },0)

        return count
    }

    private countNeighboursR(y: number, x: number){
        let count = 0

        const yMod = [-1,0,+1]
        count += this.countNeighbours(yMod, [-1,0], y, x)

        count+= yMod.reduce((acc,cur)=>{
            acc+=this.cells[y+cur][0].curLive
            return acc
        },0)

        return count
    }

    private countNeighboursL(y: number, x: number){
        let count = 0

        const yMod = [-1,0,+1]
        count += this.countNeighbours(yMod, [0,+1], y, x)

        const lastColIdx = this.cells[0].length-1
        count+= yMod.reduce((acc,cur)=>{
            acc+=this.cells[y+cur][lastColIdx].curLive
            return acc
        },0)

        return count 
    }

    private countNeighboursTL(y: number, x: number){
        let count = 0

        count+=this.countNeighbours([0,+1], [0,+1], y, x)
        const lastRowIdx = this.cells.length-1
        const lastColIdx = this.cells[0].length-1
        count+=this.cells[lastRowIdx][lastColIdx].curLive        
        count+=this.cells[0][lastColIdx].curLive        
        count+=this.cells[lastRowIdx][0].curLive

        return count        
    }

    private countNeighboursTR(y: number, x: number){
                let count = 0
        count+= this.countNeighbours([0,+1], [-1,0], y, x)
                const lastRowIdx = this.cells.length-1
        const lastColIdx = this.cells[0].length-1

        count+=this.cells[0][0].curLive
        count+=this.cells[lastRowIdx][lastColIdx].curLive
        count+=this.cells[lastRowIdx][0].curLive

        return count
    }

    private countNeighboursBR(y: number, x: number){
                let count = 0
        count+= this.countNeighbours([-1,0], [-1,0], y, x)

        const lastRowIdx = this.cells.length-1
        const lastColIdx = this.cells[0].length-1

        count+=this.cells[lastRowIdx][0].curLive
        count+=this.cells[0][0].curLive
        count+=this.cells[0][lastColIdx].curLive

        return count
    }

    private countNeighboursBL(y: number, x: number){
                let count = 0

        count+= this.countNeighbours([-1,0], [0,+1], y, x)

        const lastRowIdx = this.cells.length-1
        const lastColIdx = this.cells[0].length-1

        count+=this.cells[lastRowIdx][lastColIdx].curLive
        count+=this.cells[0][0].curLive
        count+=this.cells[0][lastColIdx].curLive

        return count
    }

    private display(){
        console.clear()
        console.log("===START===")
        this.cells.forEach((cellsRow)=>{
            console.log(`${cellsRow.map((cell)=>{
                if(!cell.curLive){
                    return " "
                }
                return `\u2588`
                })}`)
        })
        console.log("===END===")
    }

    private populate(){
        this.cells.forEach((cellsRow)=>{
            cellsRow.forEach((cell)=>{
                const rando = Math.random()*10
                if (rando > 7) {
                    cell.curLive=1
                }
            })
        })

        this.display()
    }

    private allDead(){
        let allDead = true

        this.cells.forEach((cellsRow)=>{
            if (allDead===false){
                return
            }
            cellsRow.forEach((cell)=>{
                if(cell.curLive){
                    allDead = false
                    return
                }
            })
        })

        return allDead
    }

    constructor(size: number){
        this.cells = []

        if(size < 2){
            console.error("Size must be greater than 1")
            return
        }

        const bottomIdx = size-1
        const rightIdx = size-1

        for (let i=0;i<size;i++){
            this.cells.push([])
            for (let j=0;j<size;j++){
                this.cells[i].push(new Cell(0, ()=>this.countNeighboursM(i,j)))
            }
        }

        // top count
        this.cells[0].forEach((topCell, idx)=>{
            topCell.countNeighbours = ()=>this.countNeighboursT(0, idx)
        })

        // bottom count
        this.cells[bottomIdx].forEach((bottomCell, idx)=>{
            bottomCell.countNeighbours = ()=>this.countNeighboursB(bottomIdx, idx)
        })
        
        // left count
        this.cells.forEach((cellsRow, rowIdx)=>{
            cellsRow[0].countNeighbours = ()=>this.countNeighboursL(rowIdx, 0)
        })

        // right count
        this.cells.forEach((cellsRow, rowIdx)=>{
            cellsRow[rightIdx].countNeighbours = ()=>this.countNeighboursR(rowIdx, rightIdx)
        })

        // tl count
        this.cells[0][0].countNeighbours = ()=>this.countNeighboursTL(0,0)

        // tr count
        this.cells[0][rightIdx].countNeighbours = ()=>this.countNeighboursTR(0,rightIdx)

        // br count
        this.cells[bottomIdx][rightIdx].countNeighbours = ()=>this.countNeighboursBR(bottomIdx,rightIdx)

        // bl count
        this.cells[bottomIdx][0].countNeighbours = ()=>this.countNeighboursBL(bottomIdx, 0)

        this.populate()
    }

    public tick(): boolean {
        this.cells.forEach((cellsRow)=>{
            cellsRow.forEach((cell)=>{
                cell.evalLive()
            })
        })

        this.cells.forEach((cellsRow)=>{
            cellsRow.forEach((cell)=>{
                cell.update()
            })
        })

        this.display()

        return this.allDead()
    }
}

console.clear()
const threeWorld = new World(12)

let isFinished = false
const golInterval = setInterval(()=>{
    if (isFinished===true){
        console.clear()
        console.log("END")
        clearInterval(golInterval)
        return
    }

    isFinished = threeWorld.tick()
    },
    3000)
