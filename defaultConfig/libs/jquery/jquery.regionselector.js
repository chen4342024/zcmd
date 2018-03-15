/*
 * jquery.regionselector.js
 * Description: 租租车省市区下拉框，多级选择
 */

(function ($) {
    $.fn.extend({
        regionselector: function (options) {
            //A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z
            //参数默认值
            var defualts = {
                url: '',                //数据源
                param: 'value',         //标识的参数名
                params: null,             //其它参数 { 'company_id' : '' }
                cache: false,           //是否浏览器缓存
                loading: '<img src="/img/loading-16.gif" border="0" />',  //加载时的显示
                empty: '<a class="zzc-selector-empty" href="javascript:void(0);">暂无</a>',
                text: '请选择城市地区',    //一开始选择框的显示内容
                spTitle: ', ',          //文字的分隔符
                spValue: '#@# ',        //标识的分隔符
                valueIdArr: null,         //存放选中值的元素id们
                tabArr: ['A,B,C,D,E', 'F,G,H,I,J', 'K,L,M,N,O', 'P,Q,R,S,T', 'U,V,W,X,Y,Z'],  //首字母TAB标签
                recently: 10,            //最近选中历史
                type: 'region',           //最近历史的缓存标识 brand or region 开头
                rowSize: 5,             //一级分类一行多少个
                rowSize2: 4,            //二级、三级分类一行多少个
                onShow: null,           //显示容器后触发
                onHide: null,           //隐藏容器后触发
                onInit: null,           //初始化后触发
                onSelected: null        //选中最后一级子类后触发
            };
            var _opts = $.extend({}, defualts, options);

            //选择框对象
            var _$selector = this;

            //检查选择框元素是否正常
            if( _$selector.length==0 ){
                //alert('zzc selector element error');
                return ;
            }

            //获取选择框ID，并设置容器ID
            _opts.selectorId = _$selector.attr('id');
            if( !_opts.selectorId ){
                alert('zzc selector id error');
                return ;
            }

            //检查选择框的父元素
            var _$selector_parent = _$selector.parent();
            if( !_$selector_parent ){
                alert('zzc selector parent error');
                return ;
            }

            //检查_$selector_parent的ID
            if( _$selector_parent.attr('id') ){
                _opts.selectorParentId = _$selector_parent.attr('id');
            }else{
                _opts.selectorParentId =_opts.selectorId + '_parent'
                _$selector_parent.attr('id', _opts.selectorParentId);
            }

            //存放被选中后的分类value的元素id
            if( !_opts.valueIdArr ){
                alert('zzc selector valueIdArr error');
                return ;
            }

            //存放被选中的元素对象
            var _$itemObjArr = new Array(_opts.valueIdArr.length);

            var _$tabObj = null;

            var _$recentlyObj = null;

            //选中后，存放值的元素对象
            var _$valueObjArr = new Array(_opts.valueIdArr.length);
            for(var i=0; i<_opts.valueIdArr.length; i++){
                var valueId = _opts.valueIdArr[i];
                var $valueId = $('#' + valueId);
                if( $valueId.length<1 ){
                    alert('zzc selector valueId ' + valueId + ' error');
                    return ;
                }
                _$valueObjArr[i] = $valueId;
            }

            //将容器放在选择框的父级元素的后面
            _opts.containerId = _opts.selectorId + '_container';
            _opts.containerTabId = _opts.selectorId + '_container_tab';
            _opts.containerRecentlyId = _opts.selectorId + '_container_recently';
            _opts.containerModelsId = _opts.selectorId + '_container_models';
            _$selector_parent.after('<div id="' + _opts.containerId + '" class="gm-box"><div id="' + _opts.containerTabId + '" class="tab-bg"></div><div id="' + _opts.containerRecentlyId + '" class="gp-Recently"></div><div id="' + _opts.containerModelsId + '"></div>');

            //容器对象，用来放选择内容
            var _$container = $('#' + _opts.containerId);
            var _$containerTab = $('#' + _opts.containerTabId);
            var _$containerRecently = $('#' + _opts.containerRecentlyId);
            var _$containerModels = $('#' + _opts.containerModelsId);

            //没有第三级的第二级id
            var _noNextIdArr = ['410881','429004','429005','429006','429021','460200','469001','469002','469003','469005','469006','469007','469025','469026','469027','469028','469030','469031','469033','469034','469035','469036','469037','469038','469039','620200','659001','659002','659003','659004','710500','710600','711100','711200','711300','711400','711500','711600','711700','711900','712100','712200','712300','712400','712500','712600','712700','820100','820200','990100'];

            var getSelectorFn = function(){
                //初始化选择框内容
                if( _$selector.val()=='' ){
                    _$selector.val(_opts.text);
                    _$selector.attr('title', _opts.text);
                }else{
                    return ;
                }

                var region_ids = '';
                for(var i=0; i<_$valueObjArr.length; i++){
                    var $valueObj = _$valueObjArr[i];
                    if( $valueObj && $valueObj.length>0 && $valueObj.val()!='' ){
                        region_ids += $valueObj.val()+',';
                    }
                }
                if( region_ids=='' ){
                    return ;
                }

                var t = '';
                if( !_opts.cache ){
                    t = new Date().getTime();
                }
                var url = '/api/get_selector_json.php?callback=?&t=' + t;

                var company_id = 0;
                if( _opts.params ){
                    company_id = _opts.params.company_id;
                }
                var params = {
                    'act': 'selector',
                    'type': _opts.type,
                    'company_id': company_id,
                    'region_ids': region_ids
                };
                $.getJSON(url, params,
                    function(ret){
                        if( ret && ret.status==1 && ret.items && ret.items.length>0 ) {
                            var letter = '';
                            var title_str = '';
                            var title_sp = '';
                            for(var i=0;i<ret.items.length;i++){
                                var item = ret.items[i];
                                title_str += title_sp + item.title;
                                title_sp = _opts.spTitle;

                                if( letter==''){
                                    letter = item.letter;
                                }
                            }
                            _$selector.val(title_str);
                            _$selector.attr('title', title_str);
                            for(var i=0; i<_opts.tabArr.length; i++){
                                var tab_str = _opts.tabArr[i];
                                if( tab_str.indexOf(letter)>-1 ){
                                    _$selector.attr('tabrel', i);
                                    break;
                                }
                            }

                            //执行自定义事件
                            var fn = _opts.onInit;
                            if ($.isFunction(fn)) { fn(ret.items); }
                        }
                    }
                );
            };
            getSelectorFn();

            //调整容器位置及高度
            var fixPosition = function($objTo, $item) {
                var itemTop = $item.offset().top;
                var itemHeight = $item.innerHeight();

                var $gpCity = $item.parents('.gp-City');
                var gpCityTop = $gpCity.offset().top;

                var gpCityHeight = $gpCity.attr('h');
                if( gpCityHeight==undefined ){
                    gpCityHeight = $gpCity.innerHeight();
                    $gpCity.attr('h', gpCityHeight);
                }else{
                    gpCityHeight = parseInt(gpCityHeight, 10);
                }

                var top = (itemTop + itemHeight - gpCityTop - gpCityHeight - 1 ) + 'px';
                //alert( itemTop + ' + ' + itemHeight + ' - '+ gpCityTop +' - ' + gpCityHeight + ' -1 = ' + top);
                $objTo.css('top', top);
                
                $objTo.css("display","block");

                var itemOuterHeight = $item.outerHeight();
                var rowsCity = gpCityHeight/itemOuterHeight;
                rowsCity = Math.round(rowsCity);

                var rowsItem = (itemTop-gpCityTop-1)/itemOuterHeight;
                rowsItem = Math.round(rowsItem) +1 ;

                var rowsObj = ($objTo.innerHeight())/itemOuterHeight;
                rowsObj = Math.round(rowsObj);

                //alert(rowsCity + ' ' + rowsItem + ' ' + rowsObj);
                if( rowsCity<rowsItem+rowsObj ){
                    gpCityHeight = (rowsItem+rowsObj)*itemOuterHeight;
                }

                $gpCity.height(gpCityHeight);
            };

            //点击容器外部，则隐藏容器
            var killerFn = function(e){
                var target = $(e.target);

                //是否点击选择框所在的地方
                if( target.closest('#' + _opts.selectorParentId).length>0 ){
                    return ;
                }

                //是否点击容器内
                var b_container = false;
                while(target.length>0){
                    target = target.parent();
                    if( target.length<1 ) break;
                    if( target.attr('id')==_opts.containerId ){
                        b_container = true;
                        break;
                    }
                }
                if( !b_container ){
                    onHide();
                }
            };

            //显示容器
            var onShow = function(){
                onRenderTab();
                getRecentlyFn();
                _$containerModels.html(_opts.loading);
                _$container.bgiframe();
                _$container.show();

                //绑定单击事件，以检测是否点击了容器外
                $(document).unbind('click', killerFn);
                $(document).bind('click', killerFn);

                //执行自定义事件
                var fn = _opts.onShow;
                if ($.isFunction(fn)) { fn(); }
            };

            //隐藏容器
            var onHide = function(){
                _$container.hide();
                _$containerModels.html(''); //清掉容器内容
                _$containerRecently.html('');
                _$containerTab.html('');

                //解除绑定
                $(document).unbind('click', killerFn);

                //执行自定义事件
                var fn = _opts.onHide;
                if ($.isFunction(fn)) { fn(); }
            };

            //选中后，存放选择中对象
            var setResultFn = function($item, level){
                var arrKey = level-1;
                for(var i=0; i<_$itemObjArr.length; i++)
                {
                    if( i==arrKey ){
                        _$itemObjArr[i] = $item;
                    }else if( i>arrKey ){
                        _$itemObjArr[i] = null;
                    }
                }
            };

            //拼接获取数据的url
            var getParamsFn = function(level, value){
                var params = _opts.params;
                if( !params ) params = { };
                params['level'] = level;
                params[_opts.param] = value;
                return params;
            };

            //获取数据
            var setDataFn = function($objTo, level, value){
                var t = '';
                if( !_opts.cache ){
                    t = new Date().getTime();
                }
                var url = _opts.url;
                if( url.indexOf('?')<0 ){
                    url += '?t='+t;
                }else{
                    url += '&t='+t;
                }

                var params = getParamsFn(level, value);
                $.getJSON(url, params,
                    function(ret){
                        if( ret && ret.status==1 ) {
                            onRender($objTo, level, ret.items);
                        } else {
                            alert('服务器繁忙，请稍候再试');
                        }
                    }
                );
            };

            //初始化
            var onInitShow = function(level){
                if( _$recentlyObj ){
                    var recentlyLevel = '';
                    var recentlyValue = '';
                    if( level==1 ) {
                        recentlyLevel = _$recentlyObj.attr('plevel');
                        recentlyValue = _$recentlyObj.attr('pvalue');
                    }else{
                        recentlyLevel = _$recentlyObj.attr('level');
                        recentlyValue = _$recentlyObj.attr('value');
                        _$recentlyObj = null;
                    }
                    var item_id = _opts.selectorId + '_item_' + recentlyLevel + '_' + recentlyValue;
                    $('#' + item_id).click();
                }

                if( level>=_$valueObjArr.length ){
                    _$selector.removeAttr('zzcinit');
                    return ;
                }
                var zzcinit = _$selector.attr('zzcinit');
                if( zzcinit!='1' ){
                    return ;
                }
                var initArr = _$containerModels.find(".zzc-selector-init");
                for(var i=0;i<initArr.length;i++){
                    $item = $(initArr[i]);
                    if( $item.attr('level')==level){
                        $item.click();
                    }
                }
                if( initArr.length<1){
                    _$selector.removeAttr('zzcinit');
                }
            };

            //选中后触发的事件
            var onSelected = function(){

                //将选中的内容，显示在选择框
                //将选中的value，放进相应的地方
                var titles = '';
                var values = '';
                for(var i=0; i<_$itemObjArr.length; i++){
                    $item = _$itemObjArr[i];
                    if( $item ) {
                        if( values!='' ){
                            titles += _opts.spTitle;
                            values += _opts.spValue;
                        }
                        titles += $item.attr('title');
                        values += $item.attr('value');

                        if( $item.attr('flag')!=undefined ) _$valueObjArr[i].attr('flag', $item.attr('flag'));
                        _$valueObjArr[i].attr('title', $item.attr('title'));
                        _$valueObjArr[i].val($item.attr('value'));
                    }else{
                        _$valueObjArr[i].removeAttr('flag');
                        _$valueObjArr[i].removeAttr('title');
                        _$valueObjArr[i].val('');
                    }
                }
                _$selector.val(titles);
                _$selector.attr('title', titles);
                if( _$tabObj ){
                    _$selector.attr('tabrel', _$tabObj.attr('rel'));
                }

                setRecentlyFn();

                //执行自定义函数
                var fn = _opts.onSelected;
                if ( $.isFunction(fn) ) {
                    fn(_$valueObjArr, _$itemObjArr);
                }

                onHide();
            };

            //点击Tab标签时触发
            var onSelectTab = function(tab){
                if( _$tabObj ){
                    _$tabObj.removeClass('ontab');
                }
                _$containerModels.html(_opts.loading);  //清空分类内容

                _$tabObj = $(tab);
                _$tabObj.addClass('ontab'); //设置当前状态
                setDataFn(_$containerModels, 1, _$tabObj.attr('value'));    //获取分类内容
            };

            //选中后触发的事件
            var onSelectedRecently = function(){

                //将选中的内容，显示在选择框
                //将选中的value，放进相应的地方
                var titles = '';
                var values = '';
                for(var i=0; i<_$valueObjArr.length; i++){
                    var $valueObj = _$valueObjArr[i];
                    if( $valueObj ) {
                        if( values!='' ){
                            titles += _opts.spTitle;
                            values += _opts.spValue;
                        }
                        var title = '';
                        var value = '';
                        var flag = undefined;
                        if( i==0 ){
                            title = _$recentlyObj.attr('ptitle');
                            value = _$recentlyObj.attr('pvalue');
                            flag = _$recentlyObj.attr('pflag');
                        }else{
                            title = _$recentlyObj.attr('title');
                            value = _$recentlyObj.attr('value');
                            flag = _$recentlyObj.attr('flag');
                        }
                        titles += title;
                        values += value;
                        if( flag!=undefined ) $valueObj.attr('flag', flag);
                        $valueObj.attr('title', title);
                        $valueObj.val(value);
                    }
                }
                _$selector.val(titles);
                _$selector.attr('title', titles);
                if( _$tabObj ){
                    _$selector.attr('tabrel', _$tabObj.attr('rel'));
                }

                _$recentlyObj = null;

                //执行自定义函数
                var fn = _opts.onSelected;
                if ( $.isFunction(fn) ) {
                    fn(_$valueObjArr, _$itemObjArr);
                }

                onHide();
            };

            var onSelecteRecently = function(obj){
                _$recentlyObj = $(obj);

                //小于两级的分类，则直接完成
                if( _$valueObjArr.length<3){
                    onSelectedRecently();
                    return ;
                }

                var tab_id = _opts.selectorId + '_tab_' + _$recentlyObj.attr('rel');
                if( _$tabObj && _$tabObj.attr('id')==tab_id ){
                    //刚好正是当前tab时，直接点击一级分类
                    var item_id = _opts.selectorId + '_item_'+_$recentlyObj.attr('plevel')+'_' + _$recentlyObj.attr('pvalue');
                    $('#' + item_id).click();
                }else{
                    //不是当前tab时，点击tab
                    $('#' + tab_id).click();
                }
            };

            var onRender = function($objTo, level, items){
                var render = _renderFnArr[level-1];
                render($objTo, items);
                onInitShow(level);
            };

            //点击分类时触发
            var onSelect = function(item){
                $item = $(item);

                //灰色状态的分类，点击无效果
                if( $item.hasClass('Has') ){
                    return ;
                }

                var level = $item.attr('level');
                level = parseInt(level, 10);

                setResultFn($item, level);

                if( level>=_selectFnArr.length){
                    onSelected();
                    return ;
                }

                //处理第三级暂无的情况
                if( level==2 ){
                    var nonext = $item.attr('nonext');
                    if( nonext=='1' ){
                        var zzcinit = _$selector.attr('zzcinit');
                        if( zzcinit!='1' ){
                            onSelected();
                        }else{
                            _$selector.removeAttr('zzcinit');
                        }
                        return ;
                    }
                }

                var $objTo = _selectFnArr[level-1]($item);
                
                if( $objTo ) setDataFn($objTo, level+1, $item.attr('value'));
            };

            //加载Tab标签
            var onRenderTab = function(rel){
                var tab_html = '';

                if( _opts.tabArr.length<1 ){
                    var tab_id = _opts.selectorId + '_tab_0';
                    tab_html += '<a href="javascript:void(0);" id="' + tab_id + '" rel="0" value="" class="zzc-selector-tab ontab">A-Z</a>';
                }

                for(var i=0; i<_opts.tabArr.length; i++){
                    var tab_id = _opts.selectorId + '_tab_' + i;
                    var tab_value = _opts.tabArr[i];
                    var tab_title = tab_value.replace(/,/g, ' ');
                    var tab_class = 'zzc-selector-tab ';
                    if( i==rel ) tab_class += 'ontab ';
                    tab_html += '<a href="javascript:void(0);" id="' + tab_id + '" rel="' + i + '" value="' + tab_value + '" class="' + tab_class + '">' + tab_title + '</a>';
                }
                tab_html += '<em class="r c77" style="line-height:26px;">《省份拼音首字母</em>';
                tab_html += '<div class="clear"></div>';
                _$containerTab.html(tab_html);
                if( _opts.tabArr.length<1 ){
                    _$containerTab.css('display', 'none');
                }

                _$containerTab.find('.zzc-selector-tab').click(function(){
                    onSelectTab(this);
                });
            };

            var setRecentlyFn = function(){
                var $pitemObj = _$itemObjArr[0];
                var $itemObj = _$itemObjArr[1];
                var t = '';
                if( !_opts.cache ){
                    t = new Date().getTime();
                }
                var url = '/api/get_selector_json.php?callback=?&t=' + t;

                var company_id = 0;
                if( _opts.params ){
                    company_id = _opts.params.company_id;
                }
                var params = {
                    'act': 'add',
                    'type': _opts.type,
                    'company_id': company_id,
                    'size': _opts.recently,
                    'value': $itemObj.attr('value'),
                    'title': $itemObj.attr('title'),
                    'level': $itemObj.attr('level'),
                    'rel': _$tabObj.attr('rel'),
                    'pvalue': $pitemObj.attr('value'),
                    'ptitle': $pitemObj.attr('title'),
                    'plevel': $pitemObj.attr('level')
                };
                $.getJSON(url, params,
                    function(ret){
                    }
                );
            };

            var getRecentlyFn = function(){
                _$containerRecently.html(_opts.loading);
                var t = '';
                if( !_opts.cache ){
                    t = new Date().getTime();
                }
                var url = '/api/get_selector_json.php?callback=?&t=' + t;

                var company_id = 0;
                if( _opts.params ){
                    company_id = _opts.params.company_id;
                }
                var params = {
                    'act': 'hot',
                    'type': _opts.type,
                    'company_id': company_id,
                    'size': _opts.recently
                };
                $.getJSON(url, params,
                    function(ret){
                        if( ret && ret.status==1 ) {
                            onRenderRecently(ret.items);
                        }
                    }
                );
            };

            //加载最近选择过的
            var onRenderRecently = function(items){
                var recently_html = '';

                recently_html += '热门城市：';
                if( items.length<1 ) recently_html += _opts.empty;
                for(var i=0; i<items.length; i++){
                    var recently_item = items[i];
                    recently_html += '<a class="zzc-selector-recently" href="javascript:void(0);" title="'+recently_item.title+'" value="'+recently_item.value+'" level="'+recently_item.level+'" rel="'+recently_item.rel+'" ptitle="'+recently_item.ptitle+'" pvalue="'+recently_item.pvalue+'" plevel="'+recently_item.plevel+'">'+recently_item.title+'</a>';
                }

                _$containerRecently.html(recently_html);

                _$containerRecently.find('.zzc-selector-recently').click(function(){
                    onSelecteRecently(this);
                });
            };

            var onRender_1 = function($objTo, items){
                var level = 1;
                var $valueObj = _$valueObjArr[level-1];
                var value = $valueObj.val();

                var models_html = '';
                var k = 0;
                for(var i = 0; i<items.length; i++){
                    var item = items[i];
                    var children = item.children;
                    if( !children || children.length<1 ){
                        if( i==k ) k = i+1;
                        continue;
                    }
                    //分类内容
                    item.title = item.title || '&nbsp;';
                    var models_class = (i==k?' nobor' : '');
                    models_html += '<ul class="gp-Models'+models_class+'"><li class="cls">'+item.title+'</li>';
                    models_html += '<li class="car-list">';
                    var b_span = false;
                    for(var j = 0; j<children.length; j++){
                        var child = children[j];
                        var child_id = _opts.selectorId + '_item_' + level + '_' + child.value;
                        var child_class = 'zzc-selector-' + level;
                        if( child.value==value) child_class += ' zzc-selector-init';

                        if( j%_opts.rowSize==0){
                            models_html += '<span>';
                            b_span = true;
                        }

                        models_html += '<a href="javascript:void(0);" id="'+child_id+'" class="'+child_class+'" level="'+level+'" title="'+child.title+'" value="'+child.value+'"><em>'+child.title+'</em></a>';

                        if( j%_opts.rowSize==(_opts.rowSize-1)){
                            models_html += '</span><div class="gp-City"></div>';
                            b_span = false;
                        }
                    }
                    if( b_span ){
                        models_html += '</span><div class="gp-City"></div>';
                    }
                    models_html += '<div class="clear"></div>';
                    models_html += '</li><li class="clear"></li></ul>';
                }
                $objTo.html(models_html);

                $objTo.find('.zzc-selector-'+level).click(function(){
                    onSelect(this);
                });
            };

            var onRender_2 = function($objTo, items){
                var level = 2;
                var $valueObj = _$valueObjArr[level-1];
                var value = $valueObj.val();

                var models_html = '<ul>';
                if( items.length<1 ) {
                    models_html += _opts.empty;
                }

                for(var i = 0; i<items.length; i++){
                    var item = items[i];
                    var children = item.children;
                    if( !children || children.length<1 ){
                        continue;
                    }
                    var item_class = '';
                    if( i%3==0 ) item_class = 'class="both"';
                    models_html += '<li '+item_class+'>';
                    models_html += '<span>'+item.title+'</span><div class="City-list">';

                    for(var j = 0; j<children.length; j++){
                        var child = children[j];
                        var child_id = _opts.selectorId + '_item_' + level + '_' + child.value;
                        var child_class = 'zzc-selector-' + level;
                        if( child.value==value) child_class += ' zzc-selector-init';

                        var nonext = ($.inArray(child.value, _noNextIdArr)>=0)?'1' : '0';

                        models_html += '<a href="javascript:void(0);" id="'+child_id+'" class="'+child_class+'" level="'+level+'" title="'+child.title+'" value="'+child.value+'" nonext="'+nonext+'"><em>'+child.title+'</em></a>';

                    }

                    models_html += '</div></li>';
                }

                models_html += '<li class="Region-list" style="position:relative;z-index:9999;display:none;"></li></ul>';
                $objTo.html(models_html);
                $objTo.attr('h', $objTo.innerHeight());

                $objTo.find('.zzc-selector-'+level).click(function(){
                    onSelect(this);
                    
                });

            };

            var onRender_3 = function($objTo, items){
                var level = 3;
                var $valueObj = _$valueObjArr[level-1];
                var value = $valueObj.val();

                var models_html = '<div>';
                if( items.length<1 ) {
                    models_html += _opts.empty;
                }
                for(var i = 0; i<items.length; i++){
                    var item = items[i];
                    var item_class = 'zzc-selector-' + level;
                    if( item.value==value) item_class += ' zzc-selector-init';

                    models_html += '<a href="javascript:void(0);" class="'+item_class+'" level="'+level+'" title="'+item.title+'" value="'+item.value+'" flag="' + item.flag + '">'+item.title+'</a>';

                }
                models_html += '<div class="zzc-selector-rx R-x"></div></div>';
                $objTo.html(models_html);

                $objTo.attr('h', $objTo.innerHeight());
                fixPosition($objTo, _$itemObjArr[1]);
                
                $objTo.find('.zzc-selector-'+level).click(function(){
                    onSelect(this);
                });

                $objTo.find('.zzc-selector-rx').click(function(){
                    var $itemArr = _$containerModels.find('.on-list-c');
                    $itemArr.removeClass('on-list-c');
                    $objTo.hide();
                    $objTo.html('');
                    var $gpCity = $objTo.parents('.gp-City');
                    $gpCity.height($gpCity.attr('h'));
                    return false;   //防止冒泡
                });

            };

            var onSelect_1 = function($item){

                //设置当前选中样式
                var $itemArr = _$containerModels.find('.on-list-b');
                $itemArr.removeClass('on-list-b');
                $item.addClass('on-list-b');

                //将所有一级分类下面的二级分类清空
                var $bArr = _$containerModels.find('.gp-City');
                $bArr.hide();
                $bArr.html('');

                var $objTo = $item.parent().next();
                $objTo.css('height', 'auto');
                $objTo.html(_opts.loading);
                $objTo.show();

                return $objTo;
            };

            var onSelect_2 = function($item){

                //设置当前选中样式
                var $itemArr = _$containerModels.find('.on-list-c');
                $itemArr.removeClass('on-list-c');
                $item.addClass('on-list-c');

                //将所有二级分类下面的三级分类清空
                var $bArr = _$containerModels.find('.Region-list');
                $bArr.hide();
                $bArr.html('');

                var $gpCity = $item.parents('.gp-City');
                var $objTo = $gpCity.find('.Region-list');
                $objTo.html(_opts.loading);
                fixPosition($objTo, $item);

                $objTo.unbind('mouseenter mouseleave');
                $objTo.hover(
                    function (){
                        $objTo.addClass('Region-hover');
                    },
                    function (){
                        $objTo.removeClass('Region-hover');
                    }
                );

                return $objTo;
            };

            var onSelect_3 = function($item){
                return null;
            };

            //选中触发的事件
            var _selectFnArr = [onSelect_1, onSelect_2, onSelect_3];
            _selectFnArr = _selectFnArr.slice(0,_opts.valueIdArr.length);

            //获得数据处理显示的函数
            var _renderFnArr = [onRender_1, onRender_2, onRender_3];
            _renderFnArr = _renderFnArr.slice(0,_opts.valueIdArr.length);

            //选择框获得焦点时
            _$selector_parent.click(function(){

                _$selector.attr('zzcinit', '1');    //是否需要初始化
                onShow();

                var rel = _$selector.attr('tabrel');
                if( rel ){
                    rel = parseInt(rel, 10);
                }else{
                    rel = 0;
                }
                var tab_id = _opts.selectorId + '_tab_' + rel;
                _$tabObj = $('#' + tab_id);
                _$tabObj.click();

            });

            return {
                'setParams' : function(options){
                    _opts.params = $.extend({}, _opts.params, options);
                }
            };
        }
    });
})(jQuery);