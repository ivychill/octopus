
function LYPoint(lng, lat)
{
    this.lng = lng;
    this.lat = lat;
}


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
    //this.index=index;
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
    this.projection = new BMap.Point(0,0);
    if (proj.lat > 0.0 && proj.lng > 0.0)
    {
        this.projection = proj;
    }
    this.distance=distance;  
    this.isInLine = isInline; 
    this.index = index;        
    

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



function SegmentInfo()
{
    this.rdName = "";
    this.lacList = new Array();    
    this.speedList = new Array();  
}

function SpeedInfo()
{
    this.speed = 0.0;
    this.stLng = 0.0;
    this.stLat = 0.0;
    this.edLng = 0.0;
    this.edLat = 0.0;
    this.stTime = "1970-1-1 00:00:00";
    this.edTime = "1970-1-1 00:00:00";

}

function PathLink()
{
    this.trustValue = 0.0;
    this.segmentInfoList = new Array(); 
}


function SegTraffic()
{
    this.stIndex = 0;
    this.edIndex = 0;
    this.speed = 0;
    this.stTime = "1970-1-1 00:00:00";
    this.edTime = "1970-1-1 00:00:00";
    this.avgSpeed = 0.0;
    this.count = 1;
    this.trustValue = 0.0;
    
    this.Clone = function()
    {
        var objClone = new this.constructor();
                
        objClone.stIndex = this.stIndex;
        objClone.edIndex = this.edIndex;
        objClone.speed = this.speed;
        objClone.stTime =  this.stTime;
        objClone.edTime =  this.edTime;
        objClone.avgSpeed =  this.avgSpeed;
        objClone.count =  this.count;
        objClone.trustValue =  this.trustValue;
        return objClone;
    }
}

function SegTrafficInPeriod()
{
    this.periodBegin = "1970-1-1 00:00:00";
    this.segTrafficList = new Array();
}

function PathTraffic()
{
    this.rdName = "";
    this.TraffPeriodList = new Array();
    
}


function RetTrfficInfo()
{
    this.stIndex = 0;
    this.edIndex = 0;
    this.rdPointList = new Array();

}

function getSpeedLevel(speed)
{
    var cmpSpeed = speed*1.0;
    var retLevel = 1;
    
    if (cmpSpeed > 60)
    {
        retLevel = 3;
    }
    else
    {
        if (cmpSpeed > 30)
        {
            retLevel = 2;
        }
        else
        {
            retLevel = 1;
        }
    }
    
    return retLevel;
    
}

function SpeedInMap()
{
    this.level = 1;
    this.color = "gray";
    this.lineWeight = 2;
}


function getSpeedInfo4Map(speed)
{
    var retInfo = new SpeedInMap();
    
    
    var cmpSpeed = speed*1.0;
    var retWeight = 2;
    
    if (cmpSpeed > 60)
    {
        retInfo.level = 3;
        retInfo.color = "#00FF00";
        retInfo.lineWeight = 2;
    }
    else
    {
        if (cmpSpeed > 30)
        {
            retInfo.level = 2;
            retInfo.color = "#E70EFA";
            retInfo.lineWeight = 4;
        }
        else
        {
            retInfo.level = 1;
            retInfo.color = "#FF0000";
            retInfo.lineWeight = 6;
        }
    }
    
    return retInfo;
    
}



