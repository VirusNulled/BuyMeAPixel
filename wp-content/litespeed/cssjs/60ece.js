window.$ = jQuery;
jQuery(document).ready(function() {
    var ldnaviRequest = false;
    $(".loadnavi").click(function() {
        var el = $(this);
        var pageNum = parseInt(el.attr("data-paged")) + 1;
        var max = parseInt(el.attr("data-max"));
        var nextLink = el.attr("href");
        var contentClass = "keremiya-loadnavi-page-" + pageNum + "";
        var postClassSelector = ".film-content .list_items";
        if (!ldnaviRequest) {
            ldnaviRequest = true;
            if (pageNum <= max) {
                var firstNum = pageNum;
                keremiya_modal_process(true, $(".loader", el));
                $("." + contentClass).load(nextLink + " " + postClassSelector, function() {
                    $(".current", el).text(pageNum);
                    el.attr("data-paged", pageNum);
                    pageNum++;
                    nextLink = nextLink.replace(/\/page\/[0-9]*/, "/page/" + pageNum);
                    el.attr("href", nextLink);
                    $(".loadnavi").before('<div class="keremiya-loadnavi-page-' + pageNum + '"></div>');
                    keremiya_modal_process(false, $(".loader", el));
                    ldnaviRequest = false;
                    if (firstNum == max) {
                        $(el).fadeOut();
                    }
                });
            } else {
                $(el).fadeOut();
            }
        }
        return false;
    });
    if (window.innerWidth >= 1320) {
        $(".existing_item").tipsy({
            className: "kepsy",
            kepsy: true,
            fade: true,
            html: true,
            live: true,
            opacity: 1,
            gravity: $.fn.tipsy.autoWE,
            title: function() {
                var html = $(this).find(".existing-details").html();
                return html;
            },
        });
        $(".tooltip-w").tipsy({
            live: true,
            gravity: "w",
            opacity: 0.95
        });
        $(".tooltip").tipsy({
            live: true,
            gravity: "n",
            opacity: 0.95
        });
        $(".tooltip-s").tipsy({
            live: true,
            gravity: "s",
            opacity: 0.95
        });
        $(".tooltip-sw").tipsy({
            live: true,
            gravity: "sw",
            opacity: 0.95
        });
    }
    $(".header-user").each(function() {
        var g = $(this).html();
        $(".navbar-content").prepend('<div class="menu-user">' + g + "</div>");
    });
    $(window).resize(function() {
        if (window.innerWidth > 1320) {
            $(".menu-user").hide();
            $("#navbar").removeClass("sticky");
            $(".menu-toogle").removeClass("active");
            $(".menu-item-has-children > a").off("click");
            $("#navbar").css({
                top: 0
            });
        } else {
            $(".menu-user").show();
            $(".menu-item-has-children > a").off("click").on("click", function() {
                var menuItem = $(this).parent();
                if (menuItem.hasClass("active")) {
                    menuItem.removeClass("active");
                } else {
                    $(".menu-item-has-children").not(menuItem).removeClass("active");
                    menuItem.addClass("active");
                }
                return false;
            });
            $("#navbar").css({
                top: $("#header").offset().top + $("#header").height()
            });
        }
    }).resize();
    var showChar = 9999;
    var ellipsestext = "...";
    var moretext = kL10n.more;
    var lesstext = kL10n.less;
    var excerptdiv = ".excerpt";
    $(".more").each(function() {
        var content = $(this).html();
        if (content.length > showChar) {
            var c = content.substr(0, showChar);
            var h = content.substr(showChar, content.length - showChar);
            var html = c + '<span class="moreelipses">' + ellipsestext + '</span><span class="morecontent"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="morelink">' + moretext + "</a></span>";
            $(this).html(html);
        }
    });
    $(".morelink").click(function() {
        if ($(this).hasClass("less")) {
            $(this).removeClass("less");
            $(excerptdiv).removeClass("less");
            $(this).html(moretext);
        } else {
            $(this).addClass("less");
            $(excerptdiv).addClass("less");
            $(this).html(lesstext);
        }
        $(this).parent().prev().toggle();
        $(this).prev().toggle();
        return false;
    });
    var mdformRequest = false;
    $(".modal-form form").submit(function(e) {
        e.preventDefault();
        var el = $(this);
        var success = checkform(this);
        var ss = false;
        if (success) {
            if (!mdformRequest) {
                mdformRequest = true;
                keremiya_modal_process(true, el);
                var data = {
                    action: "keremiya_user_action",
                    form: el.serialize()
                };
                $.ajax({
                    type: "post",
                    url: kL10n.ajax_url,
                    data: data,
                    success: function(r) {
                        if (r == 1) {
                            keremiya_direct($('[name="url"]', el).val());
                            ss = true;
                        } else {
                            $(".display-message", el).fadeIn();
                            $(".display-message", el).html(r);
                        }
                    },
                    complete: function() {
                        if (!ss) {
                            mdformRequest = false;
                            keremiya_modal_process(false, el);
                            keremiya_pop_fix(".modal-inner");
                        }
                    }
                });
            }
        }
    });
    var ppformRequest = false;
    $(".popup form").submit(function(e) {
        e.preventDefault();
        var el = $(this);
        var success = checkform(this);
        if (success) {
            if (!ppformRequest) {
                ppformRequest = true;
                keremiya_modal_process(true, el);
                var data = {
                    action: "keremiya_report",
                    form: el.serialize()
                };
                $.ajax({
                    type: "post",
                    url: kL10n.ajax_url,
                    data: data,
                    dataType: "json",
                    success: function(e) {
                        if (e["error"]) {
                            ppformRequest = false;
                            keremiya_show_message(e["title"], e["content"], e["footer"]);
                        } else {
                            el.append('<div class="success">' + e["html"] + "</div>");
                        }
                    },
                    complete: function() {
                        keremiya_modal_process(false, el);
                    }
                });
            }
        }
    });
    $("#commentform").submit(function(e) {
        var el = $(this);
        var success = checkform(this);
        if (success) {
            e.stopPropagation();
        } else {
            e.preventDefault();
        }
    });

    function keremiya_modal_process(is, id) {
        var inner = $(id).parent();
        if (!is) {
            $(inner).removeClass("process").removeClass("noselect");
        } else {
            $(inner).addClass("process").addClass("noselect");
        }
    }
    $(".comment-vote").off("click").on("click", function() {
        keremiya_add_spin($(this));
        keremiya_comment_vote($(this).attr("data-id"), $(this).attr("data-type"), $(this));
    });
    var usformRequest = false;
    $("#update-user").submit(function(e) {
        e.preventDefault();
        var el = $(this);
        if (!usformRequest) {
            usformRequest = true;
            keremiya_modal_process(true, el);
            var data = {
                action: "keremiya_update_user",
                form: el.serialize()
            };
            $.ajax({
                type: "post",
                url: kL10n.ajax_url,
                data: data,
                success: function(e) {
                    $(".upd").html(e).show();
                    $(".passinfo").hide();
                },
                complete: function() {
                    usformRequest = false;
                    keremiya_modal_process(false, el);
                }
            });
        }
    });
    var usformRequest = false;
    $("#delete-user").submit(function(e) {
        e.preventDefault();
        if (confirm("Are you sure you wanted to delete your account?\n\nTHIS ACTION CANNOT BE UNDONE!!")) {
            var el = $(this);
            if (!usformRequest) {
                usformRequest = true;
                keremiya_modal_process(true, el);
                var data = {
                    action: "keremiya_update_user",
                    form: el.serialize()
                };
                $.ajax({
                    type: "post",
                    url: kL10n.ajax_url,
                    data: data,
                    success: function(e) {
                        if (e == "ok") {
                            document.location.href = "/";
                        } else {
                            $(".upd").html(e).show();
                            $(".passinfo").hide();
                        }
                    },
                    complete: function() {
                        usformRequest = false;
                        keremiya_modal_process(false, el);
                    }
                });
            }
        }
    });
    var delay = function() {
        var timer = 0;
        return function(callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    }();
    $(".keremiya-share").off("click").on("click", function() {
        keremiya_share($(this).attr("data-type"));
    });
    $(".arg").off("click").on("click", function(e) {
        keremiya_direct($(".remove", this).data("url"));
    });
    $("#note .remove").click(function() {
        $(this).parent().slideUp("fast");
    });
    $(".archive-icons").click(function() {
        var sidebar = ".c-sidebar",
            filmcon = ".film-content";
        $(this).toggleClass("change");
        $(sidebar).toggleClass("show");
        $(filmcon).toggleClass("hide");
    });
    $(".wide-button").off("click").on("click", function() {
        $(".single-content.video").toggleClass("wide-popup");
        $("body").toggleClass("wide-popup");
    });
    $(".menu-toogle").off("click").on("click", function(event) {
        $(this).toggleClass("active");
        $("#navbar").toggleClass("sticky");
        $("body").toggleClass("fixed");
        event.stopPropagation();
    });
    $(".search-toogle").off("click").on("click", function(event) {
        $(this).toggleClass("active");
        $(".header-search").toggleClass("active");
        $("#s").focus();
        event.stopPropagation();
    });
    $(".user-my-account").off("click").on("click", function(event) {
        var count = $(".notify-count").length;
        $(".dropdown").not($(this)).removeClass("active");
        $(this).toggleClass("active");
        if ($(this).hasClass("user-notify")) {
            if (count > 0) {
                $.post("/wp-admin/admin-ajax.php", {
                    action: "notify_read"
                }, function() {
                    $(".notify-count").remove();
                    $(".notify-list .unread").removeClass("unread");
                    if ($(".prem_notify").length > 0) setCookie("notify_read", true, 1);
                });
            }
        }
        keremiya_remove_spin($(this).find("span"));
        event.stopPropagation();
    });
    $(".addto").on("click", function() {
        var addto = $(this),
            is = addto.data("is");
        if (is == 2) {
            var t = addto.parent().parent().parent().attr("data-this"),
                id = addto.attr("data-id"),
                icon = addto;
        } else {
            var t = addto.attr("data-this"),
                id = addto.attr("data-id"),
                icon = addto.find("span");
        }
        keremiya_add_spin(icon);
        $.ajax({
            type: "post",
            url: kL10n.ajax_url,
            data: "action=keremiya_addto&this=" + t + "&nonce=" + kL10n.nonce + "&post_id=" + id,
            dataType: "json",
            success: function(e) {
                if (e["error"]) {
                    keremiya_show_message(e["title"], e["content"], e["footer"]);
                } else {
                    if (is == 1) {
                        if (t == "fav") {
                            var wasActive = addto.hasClass("active");
                            if (!wasActive) {
                                addto.addClass("active");
                            } else {
                                addto.removeClass("active");
                            }
                        } else {
                            var wasActive = addto.hasClass("active");
                            var ribbonholder = addto.parent().parent().parent().find(".ribbonholder");
                            addto.parent().find(".reaction").removeClass("active");
                            if (!wasActive) {
                                addto.addClass("active");
                                if (t == "later") {
                                    ribbonholder.html('<span class="ribbon active later tooltip-s" title="Watch Later"><span class="icon-clock"></span></span>');
                                } else {
                                    if (t == "seen") {
                                        ribbonholder.html('<span class="ribbon active seen tooltip-s" title="Watched Before"><span class="icon-eye"></span></span>');
                                    } else {
                                        if (t == "dislike") {
                                            ribbonholder.html('<span class="ribbon active dislike tooltip-s" title="Not Interested"><span class="icon-thumbs-down-alt"></span></span>');
                                        }
                                    }
                                }
                            } else {
                                ribbonholder.html("");
                            }
                        }
                    } else {
                        if (is == 2) {
                            addto.parent().parent().hide();
                        } else {
                            addto.html(e["html"]);
                        }
                    }
                }
            },
            complete: function() {
                addtoRequest = false;
                keremiya_remove_spin(icon);
            }
        });
        return false;
    });
    $(".remove_watched").click(function() {
        var post_id = $(this).attr("data-id");
        var addto = $(this);
        addto.hide();
        $.post("/wp-admin/admin-ajax.php", {
            action: "series_removewatched",
            id: post_id
        }, function() {
            addto.parent().parent().remove();
        });
        return false;
    });
    $(".comment-reply-login").on("click", function() {
        keremiya_show_popup(this, "#popup", "#login-form");
        return false;
    });
    $(".show-modal").on("click", function() {
        keremiya_show_popup(this);
        return false;
    });
    $(".action").each(function() {
        var s = {
            d: null,
            f: false,
            e: false,
            b: 250,
            c: 100,
            a: 10,
            i: $(".trigger", this).outerHeight(true) + 18,
            g: $(".trigger", this),
            h: $(".popup", this),
        };
        $([s.g.get(0), s.h.get(0)]).mouseover(function() {
            if (s.d) {
                clearTimeout(s.d);
            }
            if (s.e || s.f) {
                return;
            } else {
                t = setTimeout(function() {
                    t = null;
                    s.e = true;
                    s.h.css({
                        display: "block",
                        top: "" + s.i + "px"
                    }).animate({
                        top: "-=" + s.a + "px",
                        opacity: 1
                    }, s.b, "swing", function() {
                        s.e = false;
                        s.f = true;
                    });
                }, 300);
            }
            return false;
        }).mouseout(function() {
            if (s.d) {
                clearTimeout(s.d);
            }
            clearTimeout(t);
            s.d = setTimeout(function() {
                s.d = null;
                s.h.animate({
                    top: "-=" + s.a + "px",
                    opacity: 0
                }, s.b, "swing", function() {
                    s.f = false;
                    s.h.removeClass("m-hide m-active");
                    s.h.css("display", "none");
                });
            }, s.c);
            return false;
        });
    });
    $("#action-parts").each(function() {
        var active_name = $(".active .part-name", this).text(),
            active_part = $(".active-part", this);
        active_part.html(active_name);
    });
    $(".tabs").each(function() {
        $("li.tab", this).click(function() {
            $(".tabs li").removeClass("active");
            $(this).addClass("active");
            $(".wrap").hide();
            var activeTab = $(this).attr("data-id");
            $("#" + activeTab).fadeIn("fast");
            return false;
        });
    });
    $(".stars").each(function() {
        var el = $(this),
            your_vote = ".your-vote span",
            stars = $("a", el);
        stars.bind("mouseenter", function(e) {
            $(this).addClass("tmp_fs").prevAll().addClass("tmp_fs");
            $(this).nextAll().addClass("tmp_es");
        });
        stars.bind("mouseleave", function(e) {
            $(this).removeClass("tmp_fs").prevAll().removeClass("tmp_fs");
            $(this).nextAll().removeClass("tmp_es");
        });
        var starsRequest = false;
        stars.bind("click", function(e) {
            var rate = $(this).text(),
                post_id = $(this).parent().attr("data-id"),
                nonce = $(this).parent().attr("data-nonce"),
                cookie = getCookie("post_rate_" + post_id);
            if (!starsRequest) {
                starsRequest = true;
                stars.removeClass("fullStar");
                $(this).addClass("fullStar").prevAll().addClass("fullStar");
                $(your_vote).html(rate);
                keremiya_modal_process(true, ".vote");
                $.ajax({
                    type: "post",
                    url: kL10n.ajax_url,
                    data: "action=keremiya_ratings&nonce=" + nonce + "&rate=" + rate + "&post_id=" + post_id,
                    dataType: "json",
                    success: function(e) {
                        if (e["error"]) {
                            stars.removeClass("fullStar");
                            $(your_vote).html("");
                            keremiya_show_message(e["title"], e["content"], e["footer"]);
                        } else {
                            $(".icon-star .average, .details .average").html(e["html"]);
                            el.append('<div class="success">' + e["message"] + "</div>");
                            delay(function() {
                                $(".success", el).fadeOut("fast");
                            }, 2000);
                            var total = $(".vote .total").text();
                            if (total) {
                                total++;
                                $(".vote .total").html(total);
                            } else {
                                $(".details").html(e["message"]);
                            }
                        }
                    },
                    complete: function() {
                        starsRequest = false;
                        keremiya_modal_process(false, ".vote");
                    }
                });
            }
            return false;
        });
    });
    $(".footer-sticky .close").on("click", function() {
        $(".footer-sticky").hide();
        return false;
    });
    $(".c-sidebar").each(function() {
        var list_width = $(this).outerWidth();
        if (list_width < 225) {
            $(this).addClass("full");
        }
    });
    $(".select-type").click(function() {
        var t = $(this).attr("data-open");
        $(".select-type").removeClass("active");
        $(".add-content form").hide();
        $(".add-content #message").hide();
        $(this).addClass("active");
        $(t).slideDown(300, function() {
            $("html, body").animate({
                scrollTop: $(this).offset().top - 80
            }, 200);
        });
        return false;
    });
    $(".submit-content").click(function() {
        keremiya_add_spin($(this));
    });
    $(".KR-head button").click(function() {
        var t = $(this).attr("data-format"),
            r = $(this).parent().attr("data-area");
        formatText(t, t, r);
    });
    $(".KR-textarea textarea").keyup(function() {
        var wordcount = countWords($(this).val());
        var parent = $(this).closest(".KR-editor");
        $("#textarea-feedback span", parent).html(wordcount);
    });
    var divs = {
        stickyID: "#sticky-sidebar",
        contentID: ".detail",
        footerID: "#footer",
        offtop: offtop ? offtop : 50,
    };
    if ($(divs.stickyID).length > 0 && sticky_sidebar) {
        var stickyTop = $(divs.stickyID).offset().top - divs.offtop;
        $(window).scroll(function() {
            if (window.innerWidth > 959) {
                keremiya_sticky(stickyTop, divs);
            }
        });
    }
    var currentRequest = null;
    $("input[name='q']").keyup(function(e) {
        var inputElem = $(this);
        var filter = $("#q").attr("filter") || "";
        if (this.searchAjaxTimer) {
            window.clearTimeout(this.searchAjaxTimer);
        }
        this.searchAjaxTimer = window.setTimeout(function() {
            if (e.key === "Escape") {
                $(".result_container").hide();
            } else {
                var text = inputElem.val();
                if (text.length > 0) {
                    if ($(".result_container").length < 1) {
                        $("<div class='result_container'></div>").appendTo("body");
                    }
                    currentRequest = $.ajax({
                        type: "GET",
                        url: "/ajax_list" + filter + "/" + text,
                        beforeSend: function() {
                            if (currentRequest != null) {
                                currentRequest.abort();
                            }
                        },
                        success: function(result) {
                            if (result.length > 0) {
                                $(".result_container").html("");
                                $.each(result, function(index, x) {
                                    var image = x["image"] != "" ? '<div class="image"><img src="' + x["image"] + '"></div>' : "",
                                        imdb = x["imdb"] != "" ? "IMDB: <b>" + x["imdb"] + "</b>" : "",
                                        year = x["year"] != "" ? "Year: " + x["year"] : "",
                                        cats = x["cats"] != "" ? "<br>" + x["cats"] : "";
                                    $('<div class="item"><a href="' + x["link"] + '">' + image + '<div class="details"><h4>' + x["title"] + "</h4>" + imdb + " " + year + cats + "</div></div></a>").appendTo(".result_container");
                                });
                                var form = inputElem.parent().parent();
                                var top = form.offset().top + form.height() + 10,
                                    left = form.offset().left,
                                    width = form.width();
                                $(".result_container").css({
                                    top: top,
                                    left: left,
                                    width: width
                                }).show();
                            } else {
                                $(".result_container").hide();
                            }
                        }
                    });
                } else {
                    $(".result_container").hide();
                }
            }
        }, 200);
    });
    $(document).off("click").on("click", function(e) {
        if ($(e.target).closest(".search-form").length === 0 && $(e.target).closest(".result_container").length === 0) {
            $(".result_container").hide();
        }
    });
    $(window).resize(function() {
        var windowHeight = $(window).height(),
            contentHeight = $("#wrap").height();
        if (windowHeight > contentHeight) {
            $("#footer").css({
                position: "absolute",
                bottom: 0
            });
        } else {
            $("#footer").removeAttr("style");
        }
    }).resize();
    if (window.trailerKey !== undefined) {
        $(".openTrailer").click(function() {
            var button = $(this);
            if (!button.hasClass("loading")) {
                button.addClass("loading");
                var id = $(this).attr("data-id");
                $.post("/wp-admin/admin-ajax.php", {
                    action: "watch_trailer",
                    id: id,
                    q: window.trailerKey
                }, function(data) {
                    $('<div class="trailer"><div class="close icon-cancel"></div>' + data + '</div><div class="trailerBack"></div>').appendTo("body");
                    $(".trailer .close, .trailerBack").click(function() {
                        $(".trailer, .trailerBack").remove();
                    });
                    var newHeight = $(".trailer").width() * 9 / 16;
                    $(".trailer").css({
                        height: newHeight,
                        marginTop: -1 * newHeight / 2
                    });
                    button.removeClass("loading");
                });
            }
        });
        $(window).resize(function() {
            var newHeight = $(".trailer").width() * 9 / 16;
            $(".trailer").css({
                height: newHeight,
                marginTop: -1 * newHeight / 2
            });
        }).resize();
    } else {
        $(".openTrailer").remove();
    }
    $(document).click(function() {
        $(".dropdown").removeClass("active");
    });
});
$.fn.isInViewport = function() {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
};

function keremiya_sticky(stickyTop, divs) {
    var windowTop = $(window).scrollTop();
    if (stickyTop < windowTop) {
        var s = {
            contentHeight: $(divs.contentID).outerHeight(true),
            contentWidth: $(divs.contentID).outerWidth() + $(divs.contentID).offset().left,
            stickyHeight: $(divs.stickyID).outerHeight(true),
            stickyTop: $(divs.stickyID).offset().top,
            stickyWidth: $(divs.stickyID).outerWidth(),
            footerTop: $(divs.footerID).offset().top,
        };
        if (s.stickyHeight < s.contentHeight) {
            $(divs.stickyID).css({
                position: "fixed",
                top: divs.offtop,
                left: $(divs.stickyID).offset().left,
                width: s.stickyWidth
            });
            var limit = s.footerTop - s.stickyHeight - divs.offtop;
            if (limit < windowTop) {
                var diff = limit - windowTop + divs.offtop;
                $(divs.stickyID).css({
                    top: diff
                });
            }
        }
    } else {
        $(divs.stickyID).css({
            position: "static",
            top: "",
            left: "",
            width: ""
        });
    }
}

function countWords(string) {
    var counter = 1;
    string = string.replace(/[\s]+/gim, " ");
    string.replace(/(\s+)/g, function(a) {
        counter++;
    });
    if (string == 0) {
        counter = 0;
    }
    return counter;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function checkform(data) {
    var error = "";
    var id = data.keremiya_action.value;
    if (id == "register") {
        if (data.register_username.value == "") {
            error = data.register_username;
        } else {
            if (!validateEmail(data.register_email.value)) {
                error = data.register_email;
            } else {
                if (data.register_email.value != data.register_re_email.value) {
                    error = data.register_re_email;
                } else {
                    if (data.register_password.value == "") {
                        error = data.register_password;
                    }
                }
            }
        }
    }
    if (id == "login") {
        if (data.login_username.value == "") {
            error = data.login_username;
        } else {
            if (data.login_password.value == "") {
                error = data.login_password;
            }
        }
    }
    if (id == "report") {
        if (data.report_excerpt.value == "") {
            error = data.report_excerpt;
        }
    }
    if (id == "comment") {
        if (data.comment.value == "") {
            error = data.comment;
        } else {
            if (data.author.value == "") {
                error = data.author;
            } else {
                if (!validateEmail(data.email.value)) {
                    error = data.email;
                }
            }
        }
    }
    if (error) {
        error.focus();
        return false;
    }
    return true;
}

function formatText(tag, end, textarea) {
    var Field = document.getElementById(textarea);
    var val = Field.value;
    var selected_txt = val.substring(Field.selectionStart, Field.selectionEnd);
    var before_txt = val.substring(0, Field.selectionStart);
    var after_txt = val.substring(Field.selectionEnd, val.length);
    Field.value = before_txt + "[" + tag + "]" + selected_txt + "[/" + tag + "]" + after_txt;
    Field.focus();
}

function keremiya_show_popup(data, is, id) {
    var s = {
        popup: !id ? $(data).attr("data-id") : id,
        is: !is ? $(data).attr("data-is") : is,
        modal: ".modal",
        bg: ".modal-bg",
        inner: ".modal-inner",
        form: ".modal-form",
        message: ".modal-message",
        header: ".modal-header",
    };
    $(s.modal).hide();
    $(s.message).hide();
    $("body").addClass("hidden");
    if (s.is) {
        $(s.form).hide();
        $(s.is).show();
    }
    $(s.popup).show();
    $(s.header).show().html($(".header-logo").html());
    $(s.bg).click(function() {
        if (s.is) {
            $(s.is).hide();
        } else {
            $(s.popup).hide();
        }
        $("body").removeClass("hidden");
    });
    $(s.header).click(function() {
        $(s.is).hide();
        $("body").removeClass("hidden");
        return false;
    });
    keremiya_pop_fix(s.inner);
}

function keremiya_pop_fix(div) {
    var popHeight = $(div).height();
    var mtop = popHeight / 2;
    $(div).css("margin-top", "-" + mtop + "px");
}

function keremiya_show_message(title, content, footer) {
    var s = {
        modal: ".modal",
        bg: ".modal-bg",
        head: ".modal-header",
        inner: ".modal-inner",
        form: ".modal-form",
    };
    var m = {
        id: ".modal-message",
        header: ".message-header",
        content: ".message-content",
        footer: ".message-footer",
        close: ".message-close"
    };
    $(s.modal).hide();
    $(s.head).hide();
    $(s.form).hide();
    $(s.modal).show();
    $("" + s.bg + ", " + m.close + "").click(function() {
        $(s.modal).hide();
    });
    $(m.id).show();
    $(m.header).html(title);
    $(m.content).html(content);
    $(m.footer).html(footer);
    $(".show-modal").on("click", function() {
        keremiya_show_popup(this);
        return false;
    });
    keremiya_pop_fix(s.inner);
}

function keremiya_add_spin(icon) {
    icon.addClass("icon-spinner1").addClass("animate-spin");
}

function keremiya_remove_spin(icon) {
    icon.removeClass("icon-spinner1").removeClass("animate-spin");
}

function keremiya_direct(e) {
    if (e) {
        window.location.href = e;
    }
}

function keremiya_share(type) {
    var url = "",
        w = 480,
        h = 380,
        x = screen.width / 2 - w / 2,
        y = screen.height / 2 - h / 2,
        u = encodeURIComponent(location.href),
        t = encodeURIComponent(document.title),
        opts = "toolbar=0,status=0" + ",width=" + w + ",height=" + h + ",top=" + y + ",left=" + x;
    if (type == "fb") {
        url = "http://www.facebook.com/sharer.php?u=" + u + "&t=" + t;
    }
    if (type == "tw") {
        url = "http://twitter.com/share?url=" + u + "&text=" + t;
    }
    if (type == "gp") {
        url = "https://plus.google.com/share?url=" + u;
    }
    window.open(url, "sharer", opts);
    return false;
}

function keremiya_comment_vote(postid, what, c) {
    var cookie = getCookie("cvote_" + postid);
    var data = {
        action: "keremiya_comment_vote",
        id: postid,
        w: what,
        c: cookie
    };
    $.post(kL10n.ajax_url, data, function(sonuc) {
        if (sonuc == 1) {
            var number = $(".count", c);
            var text = $(number).text();
            text++;
            $(number).text(text);
            $(c).addClass("active");
            setCookie("cvote_" + postid, postid, 360);
        } else {
            var split = sonuc.split("|");
            keremiya_show_message(split[0], split[1], split[2]);
        }
        keremiya_remove_spin($(c));
    });
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date;
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};