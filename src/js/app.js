var app=angular.module("wdApp",["ionic"])
	.controller("wdCtrl",["$scope","$ionicHistory",function($scope,$ionicHistory){
		$scope.goBack=function(){
			$ionicHistory.goBack();
		}
	}])
	.controller("loginCtrl",["$scope","$http","wdService","$state",function($scope,$http,wdService,$state){
		$scope.user={};
		$scope.checkLogin=function(){
			$scope.user.tip="";
			$http({
				url:"http://www.wd.com/login",
				method:'POST',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data:"name="+$scope.user.name+"&password="+$scope.user.password,
				})
				.success(function(res){
					console.log(res);
					if(res.status==1){
						wdService.saveData("wd-user",res.user);
						$state.go("tabs.home",{});
					}else if(res.status==0){
						$scope.user.tip="用户名或者秘密错误！"
					}
			})
		}
	}])
	.controller("registCtrl",["$scope","$http","wdService","$state",function($scope,$http,wdService,$state){
		
		
	}])
	.controller("homeCtrl",["$scope","$http","wdService",function($scope,$http,wdService){
		$scope.produceList=wdService.fechData("produceList");
		$scope.user={};
		if($scope.produceList.length<=0){
			LoadProduceList();
		}
		checkIsLogin();
		function checkIsLogin(){
			var user=wdService.fechData("wd-user");
//			console.log(user);
			if(user.name){
				$scope.user=user;
			}
		}
		function LoadProduceList(type){
			if(!type){type=1;}
			$http.get("http://www.wd.com/prolist")
			.success(function(res){
				if(type==1){
					$scope.produceList=res.dataList.concat($scope.produceList);
				}else if(type==2){
					$scope.produceList=$scope.produceList.concat(res.dataList);
				}
			})
			.finally(function(){
				if(type==1){
					$scope.$broadcast('scroll.refreshComplete');
				}else{
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}
				 wdService.saveData("produceList",$scope.produceList);
			})
		}
		$scope.doRefresh=function(){
			 LoadProduceList(1)
		}
		$scope.loadMore=function(){
			LoadProduceList(2)
		}
	}])
	.controller("produceCtrl",["$scope","$http",function($scope,$http){
		$scope.produceList=[];
		$scope.loadProduce=function(){
			var url="http://www.wd.com/prolist?type="+$scope.produceType;
			$http.get(url)
			.success(function(res){
				$scope.produceList=res.dataList;
				$scope.$broadcast("loadPLists",{})
			})
		}
		$scope.loadProduce();
		$scope.changeType=function(type){
			$scope.produceType=type; 
			$scope.loadProduce();
		}
	}])
	
	.config(["$stateProvider","$urlRouterProvider",function($stateProvider,$urlRouterProvider){
		$stateProvider
		.state("login",{
			url:"/login", 
			templateUrl:"templates/pages/login.html"
		})
		.state("regist",{
			url:"/regist",
			templateUrl:"templates/pages/regist.html"
		})
		.state("tabs",{
			url:"/tabs",
			templateUrl:"templates/pages/tabs.html"
		})
		.state("tabs.home",{
			url:"/home",
			views:{"home":{templateUrl:"templates/pages/home.html"}}
		})
		.state("tabs.produce",{
			url:"/produce",
			views:{"produce":{templateUrl:"templates/pages/produce.html"}}
		})
		.state("tabs.user",{
			url:"/user",
			views:{"user":{templateUrl:"templates/pages/user.html"}}
		})
		
		$urlRouterProvider.otherwise("/tabs/home")
		
	}])
	.directive("wdRender",[function(){
		return{
			restrict:"A",
			link:function(scope,elem,attr){
				scope.$on("loadPLists",function(event,data){
					if(scope.$last||scope.$first){
						setTimeout(function(){
							window.drawCircle();
						},0)
					}
				})
				if(scope.$last||scope.$first){
					setTimeout(function(){
						window.drawCircle();
					},0)
				}
			}
		}
	}])
	.factory("wdService",[function(){
		return {
			saveData:function(name,data){
				window.localStorage.setItem(name,JSON.stringify(data));
			},
			fechData:function(name){
				var str=window.localStorage.getItem(name)||"[]";
				return JSON.parse(str);
			}
		}
	}])
