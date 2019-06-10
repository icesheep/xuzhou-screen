import Base from './Base';
import CoordConvertFactory from '../CoordConvertFactory';
import CoordConvertType from '../CoordConvertType';

class HZCG extends Base{
    constructor(params) {
        super(params);
    }

    /**
     * 将经纬度转换为杭州城管坐标
     * @param lon
     * @param lat
     * @returns {*[]}
     */
    convert(lon, lat){
        var x = 6378137.0;
        var num2 = 0.0033528131778969143;
        var l = this.angle_arc2(lon);
        var b = this.angle_arc2(lat);
        var a = 120.0;
        var num5 = x * (1.0 - num2);
        var num3 = Math.sqrt(Math.pow(x, 2.0) - Math.pow(num5, 2.0)) / x;
        var num4 = Math.sqrt(Math.pow(x, 2.0) - Math.pow(num5, 2.0)) / num5;
        var num17 = l - this.angle_arc(a);
        var num15 = Math.tan(b);
        var num16 = num4 * Math.cos(b);
        var num14 = Math.sqrt(1.0 - (Math.pow(num3, 2.0) * Math.pow(Math.sin(b), 2.0)));
        var num13 = x / num14;
        var num19 = (((1.0 + (0.75 * Math.pow(num3, 2.0))) + (0.703125 * Math.pow(num3, 4.0))) + (0.68359375 * Math.pow(num3, 6.0))) + (0.67291259765625 * Math.pow(num3, 8.0));
        var num20 = -0.5 * ((((0.75 * Math.pow(num3, 2.0)) + (0.9375 * Math.pow(num3, 4.0))) + (1.025390625 * Math.pow(num3, 6.0))) + (1.07666015625 * Math.pow(num3, 8.0)));
        var num21 = 0.25 * (((0.234375 * Math.pow(num3, 4.0)) + (0.41015625 * Math.pow(num3, 6.0))) + (0.538330078125 * Math.pow(num3, 8.0)));
        var num22 = -0.16666666666666666 * ((0.068359375 * Math.pow(num3, 6.0)) + (0.15380859375 * Math.pow(num3, 8.0)));
        var num23 = 0.125 * (0.01922607421875 * Math.pow(num3, 8.0));
        var num18 = (x * (1.0 - Math.pow(num3, 2.0))) * (((((num19 * b) + (num20 * Math.sin(2.0 * b))) + (num21 * Math.sin(4.0 * b))) + (num22 * Math.sin(6.0 * b))) + (num23 * Math.sin(8.0 * b)));
        var num8 = ((num18 + ((((0.5 * num13) * num15) * Math.pow(Math.cos(b), 2.0)) * Math.pow(num17, 2.0))) + (((((0.041666666666666664 * num13) * num15) * (((5.0 - Math.pow(num15, 2.0)) + (9.0 * Math.pow(num16, 2.0))) + (4.0 * Math.pow(num16, 4.0)))) * Math.pow(Math.cos(b), 4.0)) * Math.pow(num17, 4.0))) + (((((0.0013888888888888889 * num13) * num15) * ((((61.0 - (58.0 * Math.pow(num15, 2.0))) + Math.pow(num15, 4.0)) + (270.0 * Math.pow(num16, 2.0))) - ((330.0 * Math.pow(num16, 2.0)) * Math.pow(num15, 2.0)))) * Math.pow(Math.cos(b), 6.0)) * Math.pow(num17, 6.0));
        var num9 = (((num13 * Math.cos(b)) * num17) + ((((0.16666666666666666 * num13) * ((1.0 - Math.pow(num15, 2.0)) + Math.pow(num16, 2.0))) * Math.pow(Math.cos(b), 3.0)) * Math.pow(num17, 3.0))) + ((((0.0083333333333333332 * num13) * ((((5.0 - (18.0 * Math.pow(num15, 2.0))) + Math.pow(num15, 4.0)) + (14.0 * Math.pow(num16, 2.0))) - ((58.0 * Math.pow(num16, 2.0)) * Math.pow(num15, 2.0)))) * Math.pow(Math.cos(b), 5.0)) * Math.pow(num17, 5.0));
        num9 += 500000.0;
        var num24 = 83.840107;
        var num25 = -83.745194;
        var d = 3.7684E-06;
        var num27 = 0.999991181043;
        var num6 = (num24 + ((num27 * Math.cos(d)) * num8)) - ((num27 * Math.sin(d)) * num9);
        var num7 = (num25 + ((num27 * Math.sin(d)) * num8)) + ((num27 * Math.cos(d)) * num9);
        num24 = -3266736.9496;
        num25 = -439821.9753;
        d = this.angle_arc(0.0435048);
        num27 = 1.0;
        var num10 = (num24 + ((num27 * Math.cos(d)) * num6)) - ((num27 * Math.sin(d)) * num7);
        var num11 = (num25 + ((num27 * Math.sin(d)) * num6)) + ((num27 * Math.cos(d)) * num7);

        return [num11, num10];
    }

    angle_arc(a)
    {
        return ((this.angle_descAngle(a) / 180.0) * 3.1415926535897931);
    }

    angle_arc2(a)
    {
        return (a / 180.0) * 3.1415926535897931;
    }

    angle_descAngle(a)
    {
        var num;
        var num2;
        var num3;
        var str = "" + a;
        var index = str.indexOf(".");
        if (index < 0)
        {
            num = parseInt(str, 0);
            num2 = 0;
            num3 = 0.0;
        }
        else
        {
            num = parseInt(str.substring(0, index), 0);
            var str2 = str.substring(index);
            if (str2.length == 0)
            {
                num2 = 0;
                num3 = 0.0;
            }
            else
            {
                str2 = str2.substring(1);
                if (str2.length == 0)
                {
                    num2 = 0;
                    num3 = 0.0;
                }
                else if (str2.length == 1)
                {
                    num2 = parseInt(str2, 0) * 10;
                    num3 = 0.0;
                }
                else if (str2.length == 2)
                {
                    num2 = parseInt(str2, 0);
                    num3 = 0.0;
                }
                else
                {
                    num2 = parseInt(str2.substring(0, 2), 0);
                    str2 = str2.substring(2);
                    if (str2.length == 0)
                    {
                        num3 = 0.0;
                    }
                    else if (str2.length == 1)
                    {
                        num3 = parseFloat(str2) * 10.0;
                    }
                    else if (str2.length == 2)
                    {
                        num3 = parseFloat(str2);
                    }
                    else
                    {
                        num3 = parseFloat(str2.substring(0, 2) + "." + str2.substring(2));
                    }
                }
            }
        }
        return ((((num) / 1.0) + ((num2) / 60.0)) + ((num3 / 60.0) / 60.0));
    }
}
if(!CoordConvertFactory[CoordConvertType.HZCG]){
    CoordConvertFactory[CoordConvertType.HZCG] = HZCG;
}
export default HZCG;