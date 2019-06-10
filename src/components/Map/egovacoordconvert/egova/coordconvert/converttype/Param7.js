class Param7 {
    /**
     * 7参数转换构造函数
     * @param sysID 坐标系表示。0:北京五四；1:西安80。目前只支持这两种
     * @param params
     */
    constructor(sysID, params) {
        this.val1 = 0;
        this.val2 = 0;
        this.val3 = 0;
        //7参数
        this.r = [0, 0, 0, 0, 0, 0, 0]; //[X平移,Y平移,Z平移,X旋转,Y旋转,Z旋转,以及尺度比参数]
        //4参数
        this.DX = 0;
        this.DY = 0;
        this.T = 0;
        this.K = 1;
        this.L0 = 0; //中央经度，弧度
        //是否需要X与Y对调
        this.isXYChange = false;
        this.e2 = 0;
        this.a = 0;
        this.coordType = 0;
        this.CoordConst = {
            P_2: (3600 * 180 / Math.PI),
            CoordType_WGS84: 1,
            WGS84_A: 6378137.0000000000,
            WGS84_E2: 0.0066943799013,
            CoordType_BJ54: 2,
            BJ54_A: 6378245.0000000000,
            BJ54_E2: 0.006693421622966,
            CoordType_C80: 3,
            C80_A: 6378140.0000000000,
            C80_E2: 0.006694384999588
        };

        if(sysID>=1 && sysID<=3){
            this.coordType = sysID;
        }

        var x0, y0,z0,rx0,ry0,rz0,m;
        if(params){
            var ps = params.split("@");
            //7参数
            if (ps.length >= 1) {
                var pams = ps[0].split("#");
                x0 = parseFloat(pams[0].trim());
                y0 = parseFloat(pams[1].trim());
                z0 = parseFloat(pams[2].trim());
                rx0 = parseFloat(pams[3].trim());
                ry0 = parseFloat(pams[4].trim());
                rz0 = parseFloat(pams[5].trim());
                m = parseFloat(pams[6].trim());
                var rr = [x0, y0, z0, rx0, ry0, rz0, m];
                this.r = rr;
            } else {
                console.log("params 7 is null");
            }

            //4参数
            if (ps.length >= 2) {
                var pams = ps[1].split("#");
                if (pams.length == 1) {
                    if (pams[0].trim() == "1")
                        this.isXYChange = true;
                } else {
                    this.DX = parseFloat(pams[0].trim());
                    this.DY = parseFloat(pams[1].trim());
                    this.T = parseFloat(pams[2].trim()); /// 180 * Math.PI;
                    this.K = parseFloat(pams[3].trim());
                    if (pams.length >= 5) {
                        if (pams[4].trim() == "1")
                            this.isXYChange = true;
                    }
                    if (pams.length >= 6) {
                        this.L0 = parseFloat(pams[5].trim()) / 180 * Math.PI;
                    }
                }
            } else {
                console.log("params 4 is null");
            }
        }else{
            console.log("params 7 is null");
        }
    }



    convert(lValue, bValue) {
        this.val1 = bValue;
        this.val2 = lValue;
        this.val3 = 0;
        //7参数转换
        this.doConvert();
        var resX = -1,
            resY = -1;
        resX = this.val1;
        resY = this.val2;
        //4参数转换
        var coord = this.trans(resX, resY);
        return coord;
    }

    /**
     * 四参数的转换
     * @return
     */
    trans(x, y) {
        var result = new Array(2);
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

    /**
     * 设置坐标类型
     * @param coordType 1:WGS84 2:BJ54 3:C80
     */
    setCoordType(coordType) {
        switch (coordType) {
            case this.CoordConst.CoordType_WGS84:
                this.e2 = this.CoordConst.WGS84_E2;
                this.a = this.CoordConst.WGS84_A;
                break;
            case this.CoordConst.CoordType_BJ54:
                this.e2 = this.CoordConst.BJ54_E2;
                this.a = this.CoordConst.BJ54_A;
                break;
            case this.CoordConst.CoordType_C80:
                this.e2 = this.CoordConst.C80_E2;
                this.a = this.CoordConst.C80_A;
                break;
        }
    }

    /**
     * 获取3度带中央子午线
     * @return
     */
    getMeridian() {
        if (this.val2 < 0) {
            return -1;
        }
        var L1 = this.val2 * 180 / Math.PI;
        var L2 = parseInt(L1);
        var left = L1 - L2;
        var num = parseInt(L2 / 3);
        left += L2 % 3;
        if (left >= 1.5)
            num++;
        return num * 3;
    }

    space2Space(r) {
        var X = this.val1;
        var Y = this.val2;
        var Z = this.val3;
        this.val1 = (1 + r[6]) * X + (r[5] * Y - r[4] * Z) + r[0];
        this.val2 = (1 + r[6]) * Y + (-r[5] * X + r[3] * Z) + r[1];
        this.val3 = (1 + r[6]) * Z + (r[4] * X - r[3] * Y) + r[2];
    }

    /**
     * 大地坐标转空间坐标
     * BLH->XYZ
     */
    earth2Space() {
        var B = this.val1;
        var L = this.val2;
        var H = this.val3;
        var W = Math.sqrt(1 - this.e2 * Math.sin(B) * Math.sin(B));
        var N = this.a / W;
        this.val1 = (N + H) * Math.cos(B) * Math.cos(L);
        this.val2 = (N + H) * Math.cos(B) * Math.sin(L);
        this.val3 = (N * (1 - this.e2) + H) * Math.sin(B);
    }

    /**
     * XYZ->BLH
     *
     */
    space2Earth() {
        var W = Math.sqrt(1 - this.e2 * Math.sin(this.val1) * Math.sin(this.val1));
        var N = this.a / W;
        var X = this.val1;
        var Y = this.val2;
        var Z = this.val3;
        var m;
        m = Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2));
        this.val2 = Math.atan(Y / X);
        if (this.val2 < 0)
            this.val2 += Math.PI;
        var e2_ = this.e2 / (1 - this.e2);
        var c = this.a * Math.sqrt(1 + e2_);
        var ce2 = c * this.e2;
        var k = 1 + e2_;
        var front = Z / m;
        var temp = front;
        var count = 0;
        do {
            front = temp;
            m = Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2));
            temp = Z / m + ce2 * front / (m * Math.sqrt(k + Math.pow(front, 2)));
            count++;
        } while (Math.abs(temp - front) > Math.tan(0.0001 * Math.PI / (3600 * 180)) && count < 100000); //是否在允许误差内
        this.val1 = Math.atan(temp);
        if (this.val1 < 0)
            this.val1 += Math.PI;
        W = Math.sqrt(1 - this.e2 * Math.sin(this.val1) * Math.sin(this.val1));
        N = this.a / W;
        this.val3 = m / Math.cos(this.val1) - N;
    }

    /**
     * BLH高斯投影
     * @param dL0
     */
    earth2Gauss(dL0) {
        var B = this.val1;
        var L = this.val2;
        var l = L - dL0;
        var B_2 = this.radian2Second(B);
        var CB2 = Math.cos(B) * Math.cos(B);
        var l2 = l * l;
        var N = 6399698.902 - (21562.267 - (108.973 - 0.612 * CB2) * CB2) * CB2;
        var a0 = 32140.404 - (135.3302 - (0.7092 - 0.0040 * CB2) * CB2) * CB2;
        var a4 = (0.25 + 0.00252 * CB2) * CB2 - 0.04166;
        var a6 = (0.166 * CB2 - 0.084) * CB2;
        var a3 = (0.3333333 + 0.001123 * CB2) * CB2 - 0.1666667;
        var a5 = 0.0083 - (0.1667 - (0.1968 + 0.004 * CB2) * CB2) * CB2;
        this.val1 = 6367558.4969 * B_2 / this.CoordConst.P_2 - (a0 - (0.5 + (a4 + a6 * l2) * l2) * l2 * N) * Math.sin(B) * Math.cos(B);
        this.val2 = (1 + (a3 + a5 * l2) * l2) * l * N * Math.cos(B);
        this.val2 += 500000;
    }

    /**
     * 高斯投影到地理坐标
     * @param dL0
     */
    gauss2Earth(dL0) {
        this.val2 -= 500000;
        var x = this.val1;
        var y = this.val2;
        var b = x / 6367558.4969;
        var b_2 = b * 180 * 3600 / Math.PI; //b_2以秒为单位
        var Cb2 = Math.cos(b) * Math.cos(b);
        var Bf_2 = b_2 + (50221746 + (293622 + (2350 + 22 * Cb2) * Cb2) * Cb2) * Math.pow(10, -10) * Math.sin(b) * Math.cos(b) * this.CoordConst.P_2;
        var Bf = Bf_2 * Math.PI / (180 * 3600);
        var CBf2 = Math.cos(Bf) * Math.cos(Bf);
        var Nf = 6399698.902 - (21562.267 - (108.973 - 0.612 * CBf2) * CBf2) * CBf2;
        var Z = y / (Nf * Math.cos(Bf));
        var b2 = (0.5 + 0.003369 * CBf2) * Math.sin(Bf) * Math.cos(Bf);
        var b3 = 0.333333 - (0.166667 - 0.00123 * CBf2) * CBf2;
        var b4 = 0.25 + (0.16161 + 0.00562 * CBf2) * CBf2;
        var b5 = 0.2 - (0.1667 - 0.0088 * CBf2) * CBf2;
        var Z2 = Z * Z;
        this.val1 = Bf_2 - (1 - (b4 - 0.12 * Z2) * Z2) * Z2 * b2 * this.CoordConst.P_2;
        this.val1 = this.val1 * Math.PI / (180 * 3600);
        var l = (1 - (b3 - b5 * Z2) * Z2) * Z * this.CoordConst.P_2;
        l = l * Math.PI / (180 * 3600);
        this.val2 = dL0 + l;
    }

    /**
     * 弧度到秒
     * @param r
     * @return
     */
    radian2Second(r) {
        return r * 3600 * 180 / Math.PI;
    }

    /**
     * 弧度到度分秒
     * @param r
     * @return
     */
    radian2DMS(r) {
        var t = r * 180 / Math.PI;
        var d = parseInt(t);
        var m = parseInt((t - d) * 60);
        var s = (((t - d) * 60) - m) * 60;
        if (60.0 - s < 0.01) {
            s = 0.0;
            m++;
            if (m == 60) {
                d++;
                m = 0;
            }
        }
        return (parseFloat(d) + parseFloat(m) * 0.01 + parseFloat(s) * 0.0001);
    }

    /**
     * 度分秒到弧度
     * @param dms
     * @return
     */
    DMS2Radian(dms) {
        var d = parseInt(dms);
        var m = parseInt((dms - d) * 100);
        var s = ((dms - d) * 100 - m) * 100;
        return (parseFloat(d) + parseFloat(m / 60) + s / 3600) * Math.PI / 180;
    }

    /**
     * 由WGS84到BJ54坐标转换
     * @return
     */
    doConvert() {
        this.setCoordType(this.CoordConst.CoordType_WGS84);
        this.val1 = this.val1 * Math.PI / 180;
        this.val2 = this.val2 * Math.PI / 180;
        this.earth2Space();
        this.space2Space(this.r);
        this.setCoordType(this.coordType);
        this.space2Earth();

        var n = 0;
        if (this.L0 > 0) {
            n = this.L0;
        } else {
            var m = this.getMeridian();
            if (m < 0) {
                return false;
            }
            n = this.DMS2Radian(m);
        }

        this.earth2Gauss(n);
        return true;
    }
}
export default Param7;