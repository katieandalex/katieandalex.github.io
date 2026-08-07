$(document).ready(function () {

    /***************** Waypoints ******************/

    $('.wp1').waypoint(function () {
        $('.wp1').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp2').waypoint(function () {
        $('.wp2').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp3').waypoint(function () {
        $('.wp3').addClass('animated fadeInUp');
    }, {
        offset: '75%'
    });
    $('.wp4').waypoint(function () {
        $('.wp4').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp5').waypoint(function () {
        $('.wp5').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp6').waypoint(function () {
        $('.wp6').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp7').waypoint(function () {
        $('.wp7').addClass('animated fadeInUp');
    }, {
        offset: '75%'
    });
    $('.wp8').waypoint(function () {
        $('.wp8').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp9').waypoint(function () {
        $('.wp9').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });

    /***************** Initiate Flexslider ******************/
    $('.flexslider').flexslider({
        animation: "slide"
    });

    /***************** Initiate Fancybox ******************/

    $('.single_image').fancybox({
        padding: 4
    });

    $('.fancybox').fancybox({
        padding: 4,
        width: 1000,
        height: 800
    });

    /***************** Tooltips ******************/
    $('[data-toggle="tooltip"]').tooltip();

    /***************** Nav Transformicon ******************/

    /* When user clicks the Icon */
    $('.nav-toggle').click(function () {
        $(this).toggleClass('active');
        $('.header-nav').toggleClass('open');
        event.preventDefault();
    });
    /* When user clicks a link */
    $('.header-nav li a').click(function () {
        $('.nav-toggle').toggleClass('active');
        $('.header-nav').toggleClass('open');

    });

    /***************** Header BG Scroll ******************/

    $(function () {
        $(window).scroll(function () {
            var scroll = $(window).scrollTop();

            if (scroll >= 20) {
                $('section.navigation').addClass('fixed');
                $('header').css({
                    "border-bottom": "none",
                    "padding": "35px 0"
                });
                $('header .member-actions').css({
                    "top": "40px",
                });
                $('header .navicon').css({
                    "top": "34px",
                });
            } else {
                $('section.navigation').removeClass('fixed');
                $('header').css({
                    "border-bottom": "solid 1px rgba(255, 255, 255, 0.2)",
                    "padding": "50px 0"
                });
                $('header .member-actions').css({
                    "top": "55px",
                });
                $('header .navicon').css({
                    "top": "48px",
                });
            }
        });
    });

    $( window ).load(function() {
        $(window).trigger('scroll');
    });
    /***************** Smooth Scrolling ******************/

    $(function () {

        $('a[href*=#]:not([href=#])').click(function () {
            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - 90
                    }, 2000);
                    return false;
                }
            }
        });

    });

    /********************** Social Share buttons ***********************/
    var share_bar = document.getElementsByClassName('share-bar');
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://apis.google.com/js/platform.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);

    for (var i = 0; i < share_bar.length; i++) {
        var html = '<iframe allowtransparency="true" frameborder="0" scrolling="no"' +
            'src="https://platform.twitter.com/widgets/tweet_button.html?url=' + encodeURIComponent(window.location) + '&amp;text=' + encodeURIComponent(document.title) + '&amp;via=ramswarooppatra&amp;hashtags=ramandantara&amp;count=horizontal"' +
            'style="width:105px; height:21px;">' +
            '</iframe>' +

            '<iframe src="//www.facebook.com/plugins/like.php?href=' + encodeURIComponent(window.location) + '&amp;width&amp;layout=button_count&amp;action=like&amp;show_faces=false&amp;share=true&amp;height=21&amp;appId=101094500229731&amp;width=150" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:150px; height:21px;" allowTransparency="true"></iframe>' +

            '<div class="g-plusone" data-size="medium"></div>';

        // '<iframe src="https://plusone.google.com/_/+1/fastbutton?bsv&amp;size=medium&amp;url=' + encodeURIComponent(window.location) + '" allowtransparency="true" frameborder="0" scrolling="no" title="+1" style="width:105px; height:21px;"></iframe>';

        share_bar[i].innerHTML = html;
        share_bar[i].style.display = 'inline-block';
    }

    /********************** Embed youtube video *********************/
    $('.player').YTPlayer();


    /********************** Add to Calendar **********************/
    var myCalendar = createCalendar({
        options: {
            class: '',
            // You can pass an ID. If you don't, one will be generated for you
            id: ''
        },
        data: {
            // Event title
            title: "Katie and Alex's Wedding",

            // Event start date
            start: new Date('Oct 31, 2026 16:30'),

            // Event duration (IN MINUTES)
            // duration: 120,

            // You can also choose to set an end time
            // If an end time is set, this will take precedence over duration
            end: new Date('Oct 31, 2026 22:00'),

            // Event Address
            address: '185 Lyman St, Waltham, MA 02452',

            // Event Description
            description: ""
        }
    });

    $('#add-to-cal').html(myCalendar);


    /********************** RSVP **********************/
    RSVP.init();

});

/********************** Extras **********************/

// alert_markup
function alert_markup(alert_type, msg) {
    return '<div class="alert alert-' + alert_type + '" role="alert">' + msg + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span>&times;</span></button></div>';
}

/********************** RSVP **********************/
// Name-only RSVP lookup against a Google Apps Script web app backed by a
// Google Sheet (Parties + Guests tabs). See apps-script/ for the backend and
// setup instructions. While `endpoint` is left as the PASTE_… placeholder, the
// form runs against the built-in MOCK data below so the flow can be tested
// locally without a deployed backend.
var RSVP = {

    // Deploy the Apps Script as a Web app and paste its /exec URL here.
    endpoint: 'https://script.google.com/macros/s/AKfycbxu6LX_t8Owl7-ueDF9XmtDFSsJG7nLVTUkFfR_Xt61VE0rQsSOQnQswVcE_kVS1gwx/exec',

    // RSVP cutoff — end of this day, US Eastern. Adjust as needed. Also
    // enforced server-side, since a browser's clock can't be trusted.
    deadline: new Date('2026-10-1T23:59:59-04:00'),

    party: null,

    init: function () {
        if (!$('#rsvp-lookup').length) {
            return;
        }
        var self = this;

        if (this.isClosed()) {
            this.show('rsvp-closed');
            return;
        }

        $('#rsvp-lookup-form').on('submit', function (e) {
            e.preventDefault();
            self.lookup($('#rsvp-name').val());
        });
        $('#rsvp-party-form').on('submit', function (e) {
            e.preventDefault();
            self.submit();
        });
        $('#rsvp').on('click', '.rsvp-back', function () {
            $('#rsvp-name').val('');
            self.show('rsvp-lookup');
        });
        $('#rsvp-edit').on('click', function () {
            self.show('rsvp-party');
        });
        $('#rsvp-party-choices').on('click', '.rsvp-choice', function () {
            self.lookupByParty($(this).data('party-id'));
        });
    },

    isClosed: function () {
        return new Date() > this.deadline;
    },

    // Hide every panel, reveal one, and clear any stale alerts.
    show: function (id) {
        $('#rsvp .rsvp-panel').hide();
        $('#rsvp-lookup-alert, #alert-wrapper').html('');
        $('#' + id).show();
    },

    alert: function (type, msg, selector) {
        $(selector || '#rsvp-lookup-alert').html(alert_markup(type, msg));
    },

    lookup: function (name) {
        name = $.trim(name || '');
        if (name.length < 2) {
            this.alert('danger', '<strong>Oops!</strong> Please enter your first and last name.');
            return;
        }
        this.alert('info', '<strong>One sec…</strong> looking you up.');
        this.resolve({action: 'lookup', name: name});
    },

    lookupByParty: function (partyId) {
        this.alert('info', '<strong>One sec…</strong> loading your party.', '#rsvp-lookup-alert');
        this.resolve({action: 'lookup', party_id: partyId});
    },

    resolve: function (params) {
        var self = this;
        this.request(params)
            .done(function (res) {
                self.handleLookup(res);
            })
            .fail(function () {
                self.alert('danger', '<strong>Sorry!</strong> Something went wrong. Please try again.');
            });
    },

    handleLookup: function (res) {
        if (!res || res.status === 'notfound') {
            this.show('rsvp-notfound');
        } else if (res.status === 'closed') {
            this.show('rsvp-closed');
        } else if (res.status === 'ambiguous') {
            this.renderChoices(res.parties || []);
            this.show('rsvp-ambiguous');
        } else if (res.status === 'ok') {
            this.renderParty(res);
            this.show('rsvp-party');
        } else {
            this.show('rsvp-notfound');
        }
    },

    renderChoices: function (parties) {
        var $list = $('#rsvp-party-choices').empty();
        $.each(parties, function (i, p) {
            var $btn = $('<button type="button" class="btn btn-white btn-small rsvp-choice">')
                .attr('data-party-id', p.id)
                .text(p.label);
            $list.append($('<li>').append($btn));
        });
    },

    renderParty: function (res) {
        this.party = res;
        $('#rsvp-party-id').val(res.party.id);
        $('#rsvp-party-label').text(res.party.label);
        $('#rsvp-email').val(res.party.email || '');
        $('#rsvp-note').val(res.party.note || '');

        var $list = $('#rsvp-guests').empty();
        $.each(res.guests, function (i, g) {
            var $name = $('<div class="rsvp-guest-name">').text(g.first + ' ' + g.last);
            if (g.isPlusOne) {
                $name.append(' ').append($('<span class="rsvp-badge">').text('+1'));
            }

            var $choice = $('<div class="rsvp-guest-choice">')
                .append(RSVP.radio(g.id, 'yes', 'Joyfully accepts', g.attending === 'yes'))
                .append(RSVP.radio(g.id, 'no', 'Regretfully declines', g.attending === 'no'));

            var $dietary = $('<input type="text" class="rsvp-dietary" ' +
                'placeholder="Allergies or other dietary needs (optional)">')
                .attr('name', 'dietary_' + g.id)
                .val(g.dietary || '');

            $list.append($('<li class="rsvp-guest">')
                .append($name, $choice, $('<div class="rsvp-guest-dietary">').append($dietary)));
        });
    },

    // Build a labelled radio button; values are escaped by jQuery's .text().
    radio: function (guestId, value, label, checked) {
        var $input = $('<input type="radio">')
            .attr('name', 'attending_' + guestId)
            .attr('value', value);
        if (checked) {
            $input.prop('checked', true);
        }
        return $('<label class="rsvp-radio">').append($input).append(' ' + label);
    },

    submit: function () {
        var self = this;

        var unanswered = 0;
        $('#rsvp-guests .rsvp-guest').each(function () {
            if (!$(this).find('input[type=radio]:checked').length) {
                unanswered++;
            }
        });
        if (unanswered) {
            self.alert('danger', 'Please choose an option for each guest.', '#alert-wrapper');
            return;
        }

        self.alert('info', '<strong>Saving…</strong> sending your RSVP.', '#alert-wrapper');
        var data = $('#rsvp-party-form').serialize() + '&action=submit';
        this.request(data)
            .done(function (res) {
                if (res && res.status === 'ok') {
                    self.show('rsvp-confirm');
                } else if (res && res.status === 'closed') {
                    self.show('rsvp-closed');
                } else {
                    self.alert('danger', (res && res.message) ||
                        '<strong>Sorry!</strong> We could not save your RSVP.', '#alert-wrapper');
                }
            })
            .fail(function () {
                self.alert('danger', '<strong>Sorry!</strong> There is some issue with the server.', '#alert-wrapper');
            });
    },

    // POST to the Apps Script endpoint (form-encoded = no CORS preflight), or
    // fall back to the local mock while the endpoint is unconfigured.
    request: function (data) {
        if (this.endpoint.indexOf('PASTE_') === 0) {
            return this.mock(data);
        }
        return $.ajax({url: this.endpoint, method: 'POST', data: data, dataType: 'json'});
    },

    /* ----- Local mock (used only until `endpoint` is set) ----- */

    mockData: {
        parties: {
            p001: {id: 'p001', label: 'The Skeleton Crew', email: '', note: ''},
            p002: {id: 'p002', label: 'The Hollow Coven', email: '', note: ''}
        },
        guests: [
            {id: 'g1', partyId: 'p001', first: 'John', last: 'Smith', attending: '', dietary: '', isPlusOne: false},
            {id: 'g2', partyId: 'p001', first: 'Jane', last: 'Smith', attending: '', dietary: '', isPlusOne: false},
            {id: 'g3', partyId: 'p001', first: 'Ghostly', last: 'Plus-One', attending: '', dietary: '', isPlusOne: true},
            {id: 'g4', partyId: 'p002', first: 'John', last: 'Smith', attending: '', dietary: '', isPlusOne: false}
        ]
    },

    mock: function (data) {
        var params = typeof data === 'string' ? this.parseQuery(data) : data;
        var res = params.action === 'submit' ? this.mockSubmit(params) : this.mockLookup(params);
        var d = $.Deferred();
        setTimeout(function () {
            d.resolve(res);
        }, 300);
        return d.promise();
    },

    mockLookup: function (params) {
        var self = this;
        if (params.party_id) {
            return this.partyResponse(params.party_id);
        }
        var q = this.normalize(params.name);
        var partyIds = [];
        $.each(this.mockData.guests, function (i, g) {
            var full = self.normalize(g.first + ' ' + g.last);
            if (full === q || self.normalize(g.first) === q || self.normalize(g.last) === q ||
                (q.length >= 3 && full.indexOf(q) > -1)) {
                if (partyIds.indexOf(g.partyId) === -1) {
                    partyIds.push(g.partyId);
                }
            }
        });
        if (!partyIds.length) {
            return {status: 'notfound'};
        }
        if (partyIds.length > 1) {
            return {
                status: 'ambiguous',
                parties: $.map(partyIds, function (id) {
                    return {id: id, label: self.mockData.parties[id].label};
                })
            };
        }
        return this.partyResponse(partyIds[0]);
    },

    partyResponse: function (partyId) {
        var party = this.mockData.parties[partyId];
        if (!party) {
            return {status: 'notfound'};
        }
        var guests = $.grep(this.mockData.guests, function (g) {
            return g.partyId === partyId;
        });
        return {status: 'ok', party: party, guests: guests};
    },

    mockSubmit: function (params) {
        var party = this.mockData.parties[params.party_id];
        if (!party) {
            return {status: 'error', message: 'Unknown party.'};
        }
        party.note = params.note || '';
        party.email = params.email || '';
        $.each(this.mockData.guests, function (i, g) {
            if (g.partyId !== params.party_id) {
                return;
            }
            if (params.hasOwnProperty('attending_' + g.id)) {
                g.attending = params['attending_' + g.id];
            }
            if (params.hasOwnProperty('dietary_' + g.id)) {
                g.dietary = params['dietary_' + g.id];
            }
        });
        return {status: 'ok'};
    },

    normalize: function (s) {
        return (s || '').toString().toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    parseQuery: function (str) {
        var out = {};
        $.each((str || '').split('&'), function (i, pair) {
            if (!pair) {
                return;
            }
            var kv = pair.split('=');
            var key = decodeURIComponent(kv[0].replace(/\+/g, ' '));
            out[key] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
        });
        return out;
    }
};