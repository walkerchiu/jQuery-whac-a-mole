/*
* WhacAMole
*
* https://github.com/walkerchiu/jQuery-whac-a-mole
*
*/

(function(factory){
    if (typeof define === 'function' && define.amd) {   /* RequireJS */
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {           /* Backbone.js */
        factory(require('jquery'));
    } else {                                            /* Jquery plugin */
        factory(jQuery);
    }
}(function($){
    'use strict';

    var obj, settings, distance;
    var gametimer, counter, duration, waittimer;
    var counter2, queue = [];
    var gameover = 0;
    let scores = {
        reset: function () {
            this.success = 0;
            this.fail = 0;
            this.num_target = 0;
            this.num_total = 0;
        }
    };
    let DefaultSettings = {
        'outerWidth': $(window).outerWidth(),
        'outerHeight': $(window).outerHeight(),
        'width': 5,
        'height': 5,
        'distance': 100,
        'task': 'text',
        'duration': 30,
        'waittime': 2,
        'speed': 1000,
        'curiosity': 2 
    };

    const Timer = function Timer(fn, t) {
        var timerObj = setInterval(fn, t);
        this.stop = function () {
            if (timerObj) {
                clearInterval(timerObj);
                timerObj = null;
            }
            return this;
        }
        this.start = function () {
            if (!timerObj) {
                this.stop();
                timerObj = setInterval(fn, t);
            }
            return this;
        }
        this.adjust = function (newT) {
            t = newT;
            return this.stop().start();
        }
        this.reset = function (d) {
            duration = d;
            return this.stop().start();
        }
    }
    const delay = function (s) {
        return new Promise( function (resolve,reject) {
            setTimeout(resolve,s); 
        });
    };

    function countDown(type, timer) {
        let minutes, seconds, result;
        duration = settings.duration;

        function formater() {
            minutes = parseInt(duration / 60, 10)
            seconds = parseInt(duration % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            result = minutes + ":" + seconds;

            timer.html(result);

            if (result == "00:00") { counter.stop(); GameOver(); }
            duration = (--duration < 0) ? timer : duration;
        }
        formater();

        if (type) counter = new Timer(formater, 1000);
        else      counter.reset(duration);
    }
    function play(timer) {
        queue = [];
        function producer() {
            let speed = Number(settings.speed),
                curiosity = Number(settings.curiosity);
            let size = settings.width*settings.height;
            speed = Math.random() * (1000-speed)+speed;
            curiosity = Math.floor(Math.random() * (curiosity-1)+1);

            for (let i=1; i<=curiosity;) {
                let r = Math.floor(Math.random() * size);
                let li = obj.find(".game-wrap .item[data-id='"+r+"']");
                if (li.data("status")) continue;

                r = Math.floor(Math.random() * (3-1)+1);
                let data = $("<div>", {'class': 'item-data' }), span,
                    bag = items[settings.task][r];
                let r2 = Math.floor(Math.random() * bag.length);
                let x = Math.floor(Math.random() * (15-1)+1),
                    y = Math.floor(Math.random() * (15-1)+1);
                if (settings.task == 'text')
                    span = $("<span>", {'text': bag[r2] });
                else if (settings.task == 'pic')
                    span = $("<span>").html($("<img>", {'src': bag[r2]})).css("margin-top", y).css("margin-left", x);
                if (r == 1) span.addClass("item-target");
                else        span.addClass("item-trap");

                li.data("status", 1).append(data.append(span));
                let id = setTimeout( function () {
                    data.parent().data("status", 0);
                    data.remove();
                }, (Math.random() * (10-3)+3)*1000);
                queue.push(id);
                if (r == 1)    obj.find(".game-num-target").html(++scores.num_target);
                if (!gameover) obj.find(".game-num-total").html(++scores.num_total);

                i++;
            }

            if (gameover) {
                counter2.stop();
                clearTimeout(counter2);
                $.each(queue, function (index, value) {
                    clearTimeout(value);
                }); queue = [];
                return false;
            }
            counter2.adjust(speed);
        }
        counter2 = new Timer(producer, 100);
    }
    function initContainer() {
        distance = settings.distance;
        do {
            if (distance*settings.width < settings.outerWidth && distance*settings.height < settings.outerHeight)
                break;
            else
                distance--;
        } while(1);
    }
    function initShow() {
        obj.find(".game-wrap").empty().css("width", settings.width * distance).css("height", settings.height * distance);
        obj.find(".game-score-success").html(scores.success);
        obj.find(".game-score-fail").html(scores.fail);
        obj.find(".game-num-target").html(scores.num_target);
        obj.find(".game-num-total").html(scores.num_total);

        if (settings.task == 'pic')
            obj.find(".game-wrap").css("background", "url('"+url+"') 0px 0px");

        let i = 0;
        for (let y=0; y<settings.height; y++) {
            for (let x=0; x<settings.width; x++) {
                let li = $("<li>", {'class': "item", 'data-id': i++, 'data-pos': x+'_'+y}).data("status", 0);
                obj.find(".game-wrap").append(li);
            }
        }
        obj.find("li").css("width", distance).css("height", distance);


        let left = settings.waittime;
        function wait() {
            obj.find(".game-wrap").find(".game-wait").remove();
            obj.find(".game-wrap").prepend($("<li>", {'class': "game-wait"}).append(left--)
                                                      .css("width", distance*settings.width)
                                                      .css("height", distance*settings.height)
                                                      .css("font-size", distance*settings.height + 'px')
                                                      .css("line-height", distance*settings.height + 'px'));
            if (left < 0) {
                if (counter === undefined)
                    countDown(1, gametimer);
                else
                    countDown(0, gametimer);
                counter.start();
                clearTimeout(waittimer);
                play();
                obj.find(".game-wrap").find(".game-wait").remove();
                return false;
            }
            waittimer = setTimeout(wait, 1000);
        }
        wait();
    }
    function GameOver() {
        gameover = 1;
        let title = $("<div>", {'class': "lead", 'text': "~ Game Over ~"});
        let score = $("<p>").html("Success: "+scores.success);
        let ratio = (scores.num_target == 0) ? "&infin;" : Math.round(scores.success*100 / scores.num_target) + "%";
            ratio = $("<p>").html("Success Rate: "+ratio);
        let li = $("<li>", {'class': "game-over"}).append(title).append(score).append(ratio)
                                                  .css("width", distance*settings.width+1)
                                                  .css("height", distance*settings.height+1);
        obj.find(".game-wrap").prepend(li).children("li.game-over").fadeIn();
    }

    $.fn.WKWhacAMole_init = function (options) {
        settings = $.extend(DefaultSettings, options);
        gametimer = $(this).find(".game-timer");
        obj = $(this);
        scores.reset();

        obj.find(".game-option .game-width").val(settings.width);
        obj.find(".game-option .game-height").val(settings.height);
        obj.find(".game-option .game-duration").val(settings.duration);
        obj.find(".game-option .game-waittime").val(settings.waittime);
        obj.find(".game-option .game-speed").val(settings.speed);
        obj.find(".game-option .game-curiosity").val(settings.curiosity);
        gametimer.html("Ready");

        initContainer();
        initShow();

        $(this).on("click", ".item-target", function () {
            obj.find(".game-score-success").html(++scores.success);
            $(this).addClass("catch").parent().data("status", 0).children().fadeOut();
        });
        $(this).on("click", ".item-trap", function () {
            obj.find(".game-score-fail").html(++scores.fail);
            $(this).addClass("catch").parent().data("status", 0).children().fadeOut();
        });
        $(this).on("click", ".option-btn", function () {
            obj.find(".game-option").slideToggle();
            obj.find(".restart-btn").toggle(); $(this).toggle();
        });
        $(this).on("click", ".close-btn", function () {
            obj.find(".game-option").slideUp();
            obj.find(".option-btn").show();
            obj.find(".restart-btn").hide();
        });
        $(this).on("click", ".restart-btn", function () {
            settings.width     = obj.find(".game-option .game-width").val();
            settings.height    = obj.find(".game-option .game-height").val();
            settings.duration  = obj.find(".game-option .game-duration").val();
            settings.waittime  = obj.find(".game-option .game-waittime").val();
            settings.speed     = obj.find(".game-option .game-speed").val();
            settings.curiosity = obj.find(".game-option .game-curiosity").val();

            scores.reset();
            clearTimeout(waittimer);
            counter2.stop();
            clearTimeout(counter2);
            $.each(queue, function (index, value) {
                clearTimeout(value);
            }); queue = [];
            gameover = 0;

            counter.stop();
            initContainer();
            initShow();
            obj.find(".game-option").slideToggle();
            obj.find(".option-btn").toggle(); $(this).toggle();
        });
    };

    const items = {'text': [[], ['麻竹筍','桂竹筍','蘿蔔','西瓜','鳳梨','蕃薯','地瓜','薑','花生','過貓','玉蜀黍','草莓'], ['毒蛇','野狗','蟲','山豬','獼猴','穿山甲','陷阱','水窪','蜜蜂','刺蝟','姑婆芋','咬人貓','石頭','雜草']],
                   'pic':  [[], [], []] };
}));
