;(function ($, toastr, window, document) {

    // 定义构造函数
    var SelectImg = function (ele, opt) {

        var content = '<div class="form-inline mb10 tr"><div class="form-group">' +
                '<div class="input-group">' +
                '<input class="form-control form-control-lg" id="imgUploadModalKeywords">' +
                '<span class="input-group-addon btn-success" style="color:#fff;" id="imgUploadModalSearch">搜索</span>' +
                '</div>' +
                '</div></div>' +
                '<div class="ui-box" style="overflow: scroll;height: 450px;">' +
                '<table class="table ui-table table-striped jambo_table bulk_action">' +
                '<thead>' +
                '<tr>' +
                '<th class="tc">图片</th>' +
                '<th>名称</th>' +
                '<th class="tc">时间</th>' +
                '<th class="tc">操作</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody class="imgList">' +
                '</tbody>' +
                '</table></div>' +
                '<div class="ui-box">' +
                '<div class="ui-box" style="position: absolute;bottom: 25px;right: 10px;">' +
                '<div class="widget-list">' +
                '<div>' +
                '</div>' +
                '<div class="list-page">' +
                '<div class="ui-pagination imgUploadPagination"></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>',
            title = '图片库&nbsp;-&nbsp;<a href="javascript:;" class="uploadModuleNew">新图片</a>';
        this.$element = ele;
        this.defaults = {

            selectImgPopupBtn: '.select-btn',                        // 图片选择 弹框的按钮
            selectImgBtn: '.j-select-img',                           // 图片选择 的按钮
            selectImgPopupTemplate: content,                         // 图片选择 渲染的模板
            selectImgPopupTitle: title,                              // 图片选择 模板的标题
            selectSuccess: function (item, target) {
            },                 // 图片选择 选择成功的回调函数;

            newImgBtn: '.uploadModuleNew',                           // 图片上传 弹框的按钮
            type: /.+\.(jpg|gif|png|bmp|jpeg)$/i,                    // 图片上传 的格式
            times: 1,                                                // 图片上传 规定上传的张数最多为5张;
            multiple: false,                                         // 图片上传 是否支持多张一起选择      默认为 false
            biz_code: 'mockuai_jiahao',                              // 图片上传 上传所用的biz_code
            user_id: '13',                                           // 图片上传 上传所用的user_id
            uploadSuccess: function (item, target) {
            }                  // 图片上传 上传成功的回调函数;

        };
        this.options = $.extend({}, this.defaults, opt);
    };
    // 定义方法
    SelectImg.prototype = {

        init: function () {

            // 图片选择的数组
            this.furlArr = [];

            // 图片上传的数组
            this.uploadImgArr = [];

            //默认从1开始
            this.pageId = 1;

            // 翻页配置
            this.paginationCfg = {
                pageSize: 20,
                visiblePages: 10
            };
            this.search_key = {};
            this.bind = false;

            this.addEvent();
            this.showUploadDialog();
        },

        addEvent: function () {
            var that = this;

            /**
             * dialog button
             * 弹出框的按钮
             * 点击弹出弹框
             */
            $('body').on('click', that.options.selectImgPopupBtn, function () {

                that.pageId = 1;
                that.search_key = {};
                if (!that.options.selectImgPopupTemplate || that.options.selectImgPopupTemplate == '') {
                    console.log('error,template is not found！')
                } else {
                    that.popupList()
                }
                that.currentTrigger = $(this);
            });

            $('body').on('click', '#imgUploadModalSearch', function () {
                that.search_key.keywords = $.trim($('#imgUploadModalKeywords').val());
                that.pageId = 1;
                that.imgList();
            })
        },

        /**
         * imgList：获取图片选择的图片列表
         */

        imgList: function (callback, order) {
            var that = this;

            $.ajax({
                type: 'post',
                url: window.ossDomain ? window.ossDomain : 'http://media.mockuai.com/' + 'user_file.php',
                dataType: 'json',
                data: {
                    biz_code: that.options.biz_code,
                    user_id: that.options.user_id,
                    path_id: 0,                                  // 所属文件夹ID，（默认0,代表获取根目录下文件列表） 暂未启用文件夹
                    keyword: that.search_key.keywords,           // 搜索的关键字
                    order: order == undefined ? 'desc' : order,    // 图片列表的排序
                    page: that.pageId,
                    num: that.paginationCfg.pageSize
                },
                success: function (d) {

                    if (d.code == 10000) {
                        var total = d.data.total_num;
                        var template = _.template($('#j-select-img-tpl').html());
                        // 模板渲染
                        $('.imgList').html(template({
                            items: d.data.list
                        }));
                        // 修改时间显示
                        for (var i = 0; i < $('.j-time').length; i++) {
                            var element = $('.j-time').eq(i);
                            var num = element.text();
                            that.getLocalTime(num, element)

                        }
                        // 查看大图
                        for (var n = 0; n < $('.j-blank-link').length; n++) {
                            var href = $('.j-blank-link').eq(n).attr('href').split('.')[$('.j-blank-link').eq(n).attr('href').split('.').length - 1];
                            var new_href = $('.j-blank-link').eq(n).attr('href') + '@1e_500w_500h_1c_0i_1o_90Q_1x.' + href;
                            $('.j-blank-link').eq(n).attr('href', new_href)
                        }

                        if (total == 0) {
                            $('.ui-table tbody').html('<tr><td colspan="18" style="text-align: center!important;">没有任何记录!</td></tr>');
                        }
                        that.pagination(total);

                        callback && callback()
                    }
                }
            })
        },
        // 图片选择
        chooseImg: function () {
            var that = this;
            if (that.bind == true) {
                return;
            }
            that.bind = true;

            $(document).on('click', that.options.selectImgBtn, function (e) {
                e.preventDefault();
                var $this = $(this);

                that.furl = $this.attr('data-furl');
                that.furlArr.push(that.furl);
                that.popupImgSelectModuleDialog.close();

                // todo 图片选择的成功回调、将that.furl替换成furlArr 支持多选；
                that.options.selectSuccess(that.furl, $(that.currentTrigger));
            })
        },
        pagination: function (total) {
            var that = this;
            $('.imgUploadPagination').jqPaginator({
                totalCounts: total == 0 ? 1 : total,                            // 设置分页的总条目数
                pageSize: that.paginationCfg.pageSize,                          // 设置每一页的条目数
                visiblePages: that.paginationCfg.visiblePages,                  // 设置最多显示的页码数
                currentPage: that.pageId,                                       // 设置当前的页码
                first: '<a class="first" href="javascript:;">&lt;&lt;<\/a>',
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
                last: '<a class="last" href="javascript:;">&gt;&gt;<\/a>',
                page: '<a href="javascript:;">{{page}}<\/a>',
                onPageChange: function (num, type) {
                    if (type == 'change') {
                        that.pageId = num;
                        var order = that.order;
                        var key = $('#keyword').val();
                        that.imgList(function () {
                            that.chooseImg();
                        }, order, key)
                    }
                }
            });
        },

        /**
         *
         * initUploader()
         * 初始化上传的参数；
         * 并且如果有图片选择弹框隐藏图片选择弹框
         *
         */

        showUploadDialog: function () {
            var that = this;

            $(that.options.newImgBtn).on('click', function () {
                that.popupUpload();
                if (that.popupImgSelectModuleDialog) {
                    that.popupImgSelectModuleDialog.close()
                }
                that.initUploader()
            });
        },

        /**
         * 图片选择dialog
         */

        popupList: function () {
            var that = this;
            this.popupImgSelectModuleDialog = jDialog.dialog({
                title: that.options.selectImgPopupTitle,
                content: that.options.selectImgPopupTemplate,
                width: 800,
                height: 600,
                draggable: false
            });

            this.imgList(function () {
                that.chooseImg();
                that.showUploadDialog()
            });

            window.popupImgSelectModuleDialog = this.popupImgSelectModuleDialog
        },

        /**
         * 图片上传dialog
         */

        popupUpload: function () {
            this.popupImgUploadModuleDialog = jDialog.dialog({
                title: '新图片',
                content: $('#j-upload-tpl').html(),
                width: 720,
                height: 400,
                draggable: false,
                closeable: false
            });

        },

        /**
         * 图片上传demo
         * 用于网络图片上传和本地图片上传
         */

        initUploader: function () {
            this.fileList = '';
            var $ = jQuery;
            var that = this;

            // 初始化Web Uploader
            var uploader = WebUploader.create({

                // 自动上传。
                auto: false,

                // 文件拖拽区域 如果为空则false
                dnd: '#bndArea',

                formData: {
                    user_id: that.options.user_id,
                    biz_code: that.options.biz_code
                },

                // swf文件路径
                //swf: BASE_URL + '/js/Uploader.swf',

                // 文件接收服务端。
                server: window.ossDomain + '/upload.php',

                // 选择文件的按钮。可选。
                // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick: {
                    id: '#picker',
                    innerHTML: '',
                    multiple: that.options.multiple
                },

                // 只允许选择文件，可选。
                accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,png',
                    mimeTypes: 'image/jpg,image/jpeg,image/png,image/gif'
                },
                // 配置生成缩略图的选项。
                thumb: {
                    width: 110,
                    height: 110,

                    // 图片质量，只有type为`image/jpeg`的时候才有效。
                    quality: 70,

                    // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                    allowMagnify: true,

                    // 是否允许裁剪。
                    crop: true,

                    // 为空的话则保留原有图片格式。
                    // 否则强制转换成指定的类型。
                    type: ''
                },
                fileNumLimit: 5,                   // 规定图片上传的张数 验证文件总数量, 超出则不允许加入队列。
                fileSizeLimit: 1024 * 5 * 1024,    // 200 M 验证文件总大小是否超出限制, 超出则不允许加入队列
                fileSingleSizeLimit: 1024 * 1024 // 验证单个文件大小是否超出限制, 超出则不允许加入队列。
            });
            this.uploadImgFunc($, uploader);
            this.importImgFunc($);
        },

        /**
         *
         * 网络图片选择
         *
         */

        importImgFunc: function ($) {
            var that = this;

            $('.j-import').on('click', function () {
                var $list = $('#theList .filelist');
                var wrap = $list.find('li');
                var src = $('.j-import-img').val();

                if (!that.validateFormat(src)) {
                    return false;
                }
                if (!that.validateTimes(wrap)) {
                    return false;
                }

                var $li = $(
                    '<li class="img-import img-wrap">' +
                    '<span class="j-upload-info"></span>' +
                    '<p class="title">' + src + '</p>' +
                    '<span class="uploadNetWorkCloseImg">' +
                    '<img src="style/images/uploadclose.png">' +
                    '</span>' +
                    '<img class="img" src="' + src + '">' +
                    '</li>'
                );
                $list.prepend($li);

                that.closeNetWorkImgFunc()
            });

        },

        closeNetWorkImgFunc: function () {
            $('.uploadNetWorkCloseImg').on('click', function () {
                $(this).parent().remove();
            })
        },

        uploadImgNetwork: function (url) {
            var that = this;

            $.ajax({
                type: 'post',
                dataType: 'json',
                url: window.ossDomain + '/collect_upload.php',
                data: {
                    biz_code: that.options.biz_code,
                    user_id: that.options.user_id,
                    path_id: 0,
                    image_path: JSON.stringify(url)
                },
                beforeSend: function () {
                    $('.img-import .j-upload-info').html('上传中...')
                },
                success: function (d) {
                    var $list = $('#theList .filelist');

                    if (d.code == 10000) {
                        toastr.success(d.message);
                        $('.img-import .j-upload-info').html('上传完成');
                        $('.img-import').addClass('uploadDone');

                        if (d.data) {
                            for (var i = 0; i < d.data.length; i++) {
                                var urlObj = {
                                    url: d.data[i].url,
                                    thumb: d.data[i].url
                                };
                                that.uploadImgArr.push(urlObj)
                            }
                        }

                        if ($('.uploadDone').length == $list.find('li').length) {
                            that.options.uploadSuccess(that.uploadImgArr, that.currentTrigger);
                            that.popupImgUploadModuleDialog.close();
                        }

                        $('.imgModalUpload').removeClass('imgModalUpload');

                    } else {
                        toastr.error('操作失败！')
                    }
                },
                error: function (d) {
                    toastr.error('操作失败！')
                }
            })
        },

        /**
         *
         * 本地图片选择和图片上传回调
         *
         */

        uploadImgFunc: function ($, uploader) {
            var $list = $('#theList .filelist'),
                $btn = $('.imgModalUpload'),
                $cancel = $('.imgModalCancel'),
                state = 'pending',
                that = this,

            // 添加的文件数量
                fileCount = 0,

            // 添加的文件总大小
                fileSize = 0,

            // 优化retina, 在retina下这个值是2
                ratio = window.devicePixelRatio || 1,

            // 缩略图大小
                thumbnailWidth = 200 * ratio,
                thumbnailHeight = 200 * ratio,
                status;

            // 删除文件功能
            $list.on('click', '.j-img-cancel', function () {
                var file = $(this).attr('data-id');
                uploader.removeFile(file);
                $(this).parents('#' + file).remove()
            });

            // 当有文件添加前触发
            uploader.on('beforeFileQueued', function (file) {
                var img = $('.filelist li');

                if (!that.validateTimes(img)) {
                    return false;
                }
                if (file.size > 1048576) {
                    toastr.error('当前图片的大小约为' + ((file.size / 1024) / 1024).toFixed(2) + 'MB,超出了单张上传最大为1M的限制 ！');
                    return false;
                }
            });

            // 当有文件添加进来的时候
            uploader.on('fileQueued', function (file) {

                var $li = $(
                        '<li id="' + file.id + '" class="file-item thumbnail"><p class="title">' + file.name + '</p>' +
                        '<p class="imgWrap"><img></p>' +
                            //'<div class="progress"><span class="text">上传进度是：<span class="percentage"></span></span></div>' +
                        '<div class="file-panel"><div class="cancel-wrapper"><span class="img-modal-cancel j-img-cancel" data-id="' + file.id + '"><img src="style/images/uploadclose.png"></div></span></div>' +
                        '</li>'
                    ),
                    $img = $li.find('.imgWrap img');

                $list.prepend($li);
                fileSize += file.size;

                // 创建缩略图
                uploader.makeThumb(file, function (error, src) {
                    if (error) {
                        $img.replaceWith('<span>亲~你的文件走丢了</span>');
                        return;
                    }

                    $img.attr('src', src);
                }, thumbnailWidth, thumbnailHeight);

                /**
                 * getStats()
                 * 获取文件统计信息。返回一个包含一下信息的对象。
                 * successNum 上传成功的文件数
                 * progressNum 上传中的文件数
                 * cancelNum 被删除的文件数
                 * invalidNum 无效的文件数
                 * uploadFailNum 上传失败的文件数
                 * queueNum 还在队列中的文件数
                 * interruptNum 被暂停的文件数
                 * */
                var info = uploader.getStats();
                console.log(info)
            });

            //todo 重新上传

            uploader.on('all', function (type) {
                if (type === 'startUpload') {
                    state = 'uploading';
                } else if (type === 'stopUpload') {
                    state = 'paused';
                } else if (type === 'uploadFinished') {
                    state = 'done';
                }

                if (state === 'uploading') {
                    $btn.text('开始上传');
                } else {
                    $btn.text('开始上传');
                }
            });

            // 开始上传
            $btn.on('click', function () {
                var netWorkImgArr = [];
                if ($list.find('.img-import').length >= 1) {
                    for (var i = 0; i < $list.find('.img-import').length; i++) {
                        var src = $list.find('.img-import .img').eq(i).attr('src');
                        netWorkImgArr.push(src);
                    }
                    that.uploadImgNetwork(netWorkImgArr)
                }
                that.uploadImgArr = [];
                if (state === 'uploading') {
                    uploader.stop();
                } else {
                    uploader.upload();
                }
            });

            // 取消
            $cancel.on('click', function () {
                that.popupImgUploadModuleDialog.close();
            });

            // 文件上传过程中创建进度条实时显示。
            uploader.on('uploadProgress', function (file, percentage) {
                var $li = $('#' + file.id),
                    $percent = $li.find('.progress span');
                var $error = $li.find('div.error');

                // 避免重复创建
                if (!$error.length) {
                    $error = $('<div class="error"></div>').appendTo($li);
                }
                $error.text('上传中...');

                // 避免重复创建
                if (!$percent.length) {
                    $percent = $('<p class="upload-progress"><span></span></p>')
                        .appendTo($li)
                        .find('span');
                }

                $percent.css('width', percentage * 100 + '%');
            });

            uploader.on('uploadStart', function (file) {
                var $li = $('#' + file.id);
                var $error = $li.find('div.error');
                // 避免重复创建
                if (!$error.length) {
                    $error = $('<div class="error"></div>').appendTo($li);
                }
                $error.text('上传开始！')
            });

            // 文件上传成功，给item添加成功class, 用样式标记上传成功。
            uploader.on('uploadSuccess', function (file, res) {
                $('#' + file.id).addClass('upload-state-done');
                var $li = $('#' + file.id);
                var $error = $li.find('div.error');
                $li.addClass('uploadDone');
                $error.text('上传完成！');
                var urlObj = {
                    url: res.data.url,
                    thumb: res.data.thumb
                };
                that.uploadImgArr.push(urlObj);
                if ($('.uploadDone').length == $list.find('li').length) {
                    that.options.uploadSuccess(that.uploadImgArr, that.currentTrigger);
                    that.popupImgUploadModuleDialog.close();
                }
            });

            // 文件上传失败，现实上传出错。
            uploader.on('uploadError', function (file, res) {
                var $li = $('#' + file.id),
                    $error = $li.find('div.error');

                // 避免重复创建
                if (!$error.length) {
                    $error = $('<div class="error"></div>').appendTo($li);
                }

                $error.text('上传失败');
                $li.addClass('uploadDone');
                console.log(uploader.getStats())
            });

            // 完成上传完了，成功或者失败，先删除进度条。
            uploader.on('uploadComplete', function (file) {
                $('#' + file.id).find('.progress').remove();
            });
        },

        /**
         *
         * 公共处理方法
         *
         */

        // 时间戳转换
        getLocalTime: function (nS, element) {
            var time = new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
            element.text(time)

        },

        // 验证图片格式
        validateFormat: function (element) {

            if (!this.options.type.test(element)) {
                toastr.error('亲，图片的格式不正确！');
                return false;
            }
            return true;
        },

        // 验证上传的图片的张数
        validateTimes: function (element) {

            if (element.length >= 5) {
                toastr.error('图片单次上传上限为5张，请先提交');
                return false;
            }

            if (this.options.times) {
                if (element.length >= this.options.times) {
                    toastr.error('抱歉，该地方只许选择' + this.options.times + '张上传 ！');
                    return false;
                }
            }
            return true;
        }
    };
    // 在插件中使用对象
    $.fn.imgModal = function (options) {
        // 创建实体
        var selectImg = new SelectImg(this, options);
        //console.log(this);
        //console.log($.fn);
        //console.log(jQuery.prototype);
        // 调用其方法
        selectImg.init()
    }
})(jQuery, toastr, window, document);
