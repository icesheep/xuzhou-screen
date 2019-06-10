class Base{
	
	constructor(params){
		this.params = params;
	}

    /**
     * ��������Ե�����ת��
     * @param x �����Ȼ�ƽ��x
     * @param y ����γ�Ȼ�ƽ��y
     */
	convert(x,y){
		
	}

    /**
     * �������Ե�����ת��
     * @param coords ��������飬����Ԫ��Ϊһ�������[x,y]��Ҳ��һ����ά����
     */
    multiConvert(coords){
        if(!Array.isArray(coords) || coords.length==0){
            return null;
        }
        var result = [];
        for(var i = 0; i < coords.length; i++) {
            var coord = coords[i];
            var convertedCoord = this.convert(coord[0],coord[1]);
            result.push(convertedCoord);
        }
        return result;
    }
}

export default Base;