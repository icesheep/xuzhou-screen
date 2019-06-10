class Param4{
    constructor(sysID, params) {
        this.k0 = 1;
        this.MA = [6378245, 6378140, 6378137];
        this.MB = [6356863.0188, 6356755.2882, 6356752.3142];
        this.L = 0;  //经度°′″形式
        this.B = 0;  //纬度°′″形式
        this.a = 0;  //长轴
        this.b = 0; //短轴
        this.L0 = 0; //中央经度，弧度
        this.coordSysID = 1;//坐标系：0:北京54采用;1:西安80; 2:WGS 84
        this.DX = 0;
        this.DY = 0;
        this.T = 0;
        this.K = 1;
        this.isXYChange = false; //是否需要X与Y对调

        if(sysID>=0 && sysID<=2){
            this.a = this.MA[sysID];
            this.b = this.MB[sysID];
        }
        if (params) {
            var pams = params.split("#");
            this.DX = parseFloat(pams[0].trim());
            this.DY = parseFloat(pams[1].trim());
            this.T = parseFloat(pams[2].trim());
            this.K = parseFloat(pams[3].trim());

            if (pams.length >= 5) {
                if(pams[4].trim()=="1")
                    this.isXYChange = true;
            }
            if(pams.length >= 6){
                this.L0 = parseFloat(pams[5].trim())/ 180 * Math.PI;
            }
        }
    }

    /**
     * 四参数法坐标转换
     * @param lon 经度
     * @param lat 纬度
     * @returns {*|Array}
     */
    convert(lon,lat) {
        var l1 = lon;
        var b1 = lat;
        var l2 = this.getRad(l1);
        var b2 = this.getRad(b1);

        if(this.L0==0){
            this.L0 = this.getMeridian(l2) / 180 * Math.PI;
        }

        this.L = l2;
        this.B = b2;

        var M = this.getM();
        var A = this.getA();
        var N = this.getN();
        var T = this.getT();
        var C = this.getC();
        var FE = 500000;
        var part1 = M;
        var temp1 = Math.pow(A, 2) / 2
            + (5 - T + 9 * C + 4 * Math.pow(C, 2)) * Math.pow(A, 4) / 24;
        var part2 = N * Math.tan(this.B) * (Math.pow(A, 2) / 2
            +
            (5 - T + 9 * C + 4 * Math.pow(C, 2)) *
            Math.pow(A, 4) / 24);
        var part3 = (61 - 58 * T + Math.pow(T, 2) + 270 * C - 330 * T * C) *
            Math.pow(A, 6) / 720;

        var x = part1 + part2 + part3;
        part1 = FE;
        part2 = A;
        part3 = (1 - T + C) * Math.pow(A, 3) / 6;
        var part4 = (5 - 18 * T - Math.pow(T, 2) + 14 * C - 58 * T * C) *
            Math.pow(A, 5) / 120;
        var y = part1 + this.k0 * N * (part2 + part3 + part4);
        var coord = this.trans(x,y);

        return coord;
    }

    /**
     * 获取3度带中央子午线
     * @return
     */
    getMeridian(val2) {
        if (val2 < 0) {
            return -1;
        }
        var L1 = val2 * 180 / Math.PI;
        var L2 = parseInt(L1);
        var left = L1 - L2;
        var num = parseInt(L2 / 3);
        left += L2 % 3;
        if (left >= 1.5) num++;
        return num * 3;
    }


    getRad(d) {
        return d / 180 * Math.PI;
    }

    /**
     * 获得扁率 (a-b)/a
     * @return double
     */
    getFlattening() {
        return (this.a - this.b) / this.a;
    }

    /**
     * 获得第一偏心率 对（1-(b/a)*(b/a)）求根
     * @return double
     */
    getEccentricity() {
        return Math.sqrt(1 - Math.pow(this.b / this.a, 2));
    }

    /**
     * 获得第二偏心率 对((a/b)*(a/b)-1)求根
     * @param coordSysID int
     * @return double
     */
    getSEccentricity() {
        var temp = this.a * 1.0 / this.b;
        //System.out.println("getSEccentricity  a/b = " + temp);
        //System.out.println("e' = " + Math.sqrt(temp * temp - 1));
        return Math.sqrt(temp * temp - 1);
    }

    /**
     * 获得卯酉圈曲率半径 a/对(1-(e*e) * (sinB*sinB))求根
     * @param coordSysID int
     * @param B double
     * @return double
     */
    getN() {
        var e = this.getEccentricity();
        return this.a / Math.sqrt(1 - Math.pow(e, 2) * Math.pow(Math.sin(this.B), 2));
    }

    /**
     * tgB * tgB
     * @param coordSysID int
     * @param B double
     * @return double
     */
    getT() {
        return Math.pow(Math.tan(this.B), 2);
    }

    getC() {
        var se = this.getSEccentricity();
        //System.out.println("\tse*se = " + se * se);
        return Math.pow(se, 2) * Math.pow(Math.cos(this.B), 2);
    }

    getA() {
        return (this.L - this.L0) * Math.cos(this.B);
    }

    getM() {
        var e = this.getEccentricity();
        var temp1 = (1 - Math.pow(e, 2) / 4
            - 3 * Math.pow(e, 4) / 64
            - 5 * Math.pow(e, 6) / 256);

        var part1 = (1 - Math.pow(e, 2) / 4
            - 3 * Math.pow(e, 4) / 64
            - 5 * Math.pow(e, 6) / 256) * this.B;
        var part2 = (3 * Math.pow(e, 2) / 8
            + 3 * Math.pow(e, 4) / 32
            + 45 * Math.pow(e, 6) / 1024) * Math.sin(2 * this.B);
        var part3 = (15 * Math.pow(e, 4) / 256
            + 45 * Math.pow(e, 6) / 1024) * Math.sin(4 * this.B);
        var part4 = (35 * Math.pow(e, 6) / 3072) * Math.sin(6 * this.B);
        return this.a * (part1 - part2 + part3 - part4);
    }

    /**
     * 加偏移量和位置互换
     * @param x
     * @param y
     * @returns {Array}
     */
    trans(x, y) {
        var result = [];
        if (this.isXYChange) {
            //按现场实际情况，对调xy坐标
            result[1] = this.DX + this.K * (x * Math.cos(this.T) - y * Math.sin(this.T));
            result[0] = this.DY + this.K * (x * Math.sin(this.T) + y * Math.cos(this.T));
        } else {
            result[0] = this.DX + this.K * (x * Math.cos(this.T) - y * Math.sin(this.T));
            result[1] = this.DY + this.K * (x * Math.sin(this.T) + y * Math.cos(this.T));
        }
        return result;
    }
}
export default Param4;