

function BTSSite(lng, lat, raid, cellid)
{
    this.lng=lng;
    this.lat=lat;
    this.raid=raid;
    this.cellid=cellid;
    this.roadNames = new Array();
    this.roadIndex = new Array();
    
    this.Clone = function()
    {
        var objClone = new this.constructor();//0,0,0,"dd");
        objClone.lng    = this.lng;
        objClone.lat    =this.lat;
        objClone.raid   =this.raid;
        objClone.cellid =this.cellid;
        objClone.roadNames = new Array();
        objClone.roadIndex = new Array();

        
        for (var tii = 0; tii< this.roadNames.length; tii++)
        {
            objClone.roadNames.push(this.roadNames[tii]);
        }
        
        for (var tii = 0; tii< this.roadIndex.length; tii++)
        {
            objClone.roadIndex.push(this.roadIndex[tii]);
        }
        
        return objClone;
    }

}

function LocationUpdateInfo(time, phonenumber, cellid)
{
    this.time=time;
    this.phonenumber=phonenumber;
    this.cellid=cellid;
    
    this.lng=0.0;
    this.lat=0.0;
    this.raid=0;
    this.roadNames = new Array();
    this.roadIndex = new Array();
    
    this.switchIndex = 0;
    
    this.Clone = function()
    {
        var objClone = new this.constructor();//0,0,0,"dd");
        
        objClone.time    = this.time;
        objClone.phonenumber    =this.phonenumber;

        objClone.lng    = this.lng;
        objClone.lat    =this.lat;
        objClone.raid   =this.raid;
        objClone.cellid =this.cellid;
        
        objClone.switchIndex =this.switchIndex;

        objClone.roadNames = new Array();
        objClone.roadIndex = new Array();
        
        
        for (var tii = 0; tii< this.roadNames.length; tii++)
        {
            objClone.roadNames.push(this.roadNames[tii]);
        }
        
        for (var tii = 0; tii< this.roadIndex.length; tii++)
        {
            objClone.roadIndex.push(this.roadIndex[tii]);
        }
        
        return objClone;
    }

}



function DistInfo(proj, distance, isInline, index)
{
    this.projection = new BMap.Point(0,0);//projection;
    if (proj.lat > 0.0 && proj.lng > 0.0)
    {
        this.projection = proj;
    }
    this.distance=distance;  //米
    this.isInLine = isInline; //0,1
    this.index = index;         //在多点路径中的Index
    

}


function RoadPntCnt(name, count)
{

    this.name = name;
    this.count = count;
    this.pointList = new Array();
    

}


function RoadInfo(name)
{
    this.name = name;
    this.pointList = new Array();
    

}
