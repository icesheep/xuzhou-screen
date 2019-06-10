import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';



class MutilStep extends Base{
    constructor(steps,params) {
        super(params);
        this.convertFactorys = [];
        var paramNum = 0;
        for(var i in steps){
            var tempStep = steps[i];
            if(tempStep.param){
                paramNum++;
                this.convertFactorys.push(new CoordConvertFactory[tempStep.type](arguments[paramNum]));
            }else {
                this.convertFactorys.push(new CoordConvertFactory[tempStep.type](""));
            }
        }
    }

    convert(x,y){
        var data = arguments;
        for(var i in this.convertFactorys){
            data = this.convertFactorys[i].convert.apply(this.convertFactorys[i],data);
        }
        return data;
    }
}
export default MutilStep;