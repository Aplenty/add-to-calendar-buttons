(function(exports) {
  exports.createCalendar = function(params) {
    var msInMinutes = 60 * 1000;

    var formatTime = function(date) {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    var calculateEndTime = function(event) {
      return event.end ? formatTime(event.end) : formatTime(new Date(event.start.getTime() + (event.duration * msInMinutes)))
    };

    var calendarGenerators = {
      google: function(event) {
        var startTime = formatTime(event.start);
        var endTime = calculateEndTime(event);

        var href = encodeURI([
          'https://www.google.com/calendar/render',
          '?action=TEMPLATE',
          '&text=' + (event.title || ''),
          '&dates=' + (startTime || ''),
          '/' + (endTime || ''),
          '&details=' + (event.description || ''),
          '&location=' + (event.address || ''),
          '&sprop=&sprop=name:'
        ].join(''));
        return '<a class="icon-google" target="_blank" href="' + href + '">Google Calendar</a>'
      },

      yahoo: function(event) {
        var eventDuration = event.end ? ((event.end.getTime() - event.start.getTime())/ msInMinutes) : event.duration;
        // Yahoo dates are crazy, we need to convert the duration from minutes to hh:mm
        var yahooHourDuration = eventDuration < 600 ? '0' + Math.floor((eventDuration / 60)) : Math.floor((eventDuration / 60));
        var yahooMinuteDuration = eventDuration % 60 < 10 ? '0' + eventDuration % 60 : eventDuration % 60;
        var yahooEventDuration = yahooHourDuration + yahooMinuteDuration;

        var href = encodeURI([
          'http://calendar.yahoo.com/?v=60&view=d&type=20',
          '&title=' + (event.title || ''),
          '&st=' + (formatTime(new Date(event.start - (event.start.getTimezoneOffset() * msInMinutes))) || ''), // Remove timezone from event time
          '&dur=' + (yahooEventDuration || ''),
          '&desc=' + (event.description || ''),
          '&in_loc=' + (event.address || '')
        ].join(''));
        return '<a class="icon-yahoo" target="_blank" href="' + href + '">Yahoo! Calendar</a>';
      },

      ics: function(event, eClass, calendarName) {
        var startTime = formatTime(event.start);
        var endTime = calculateEndTime(event);

        var href = encodeURI(
          'data:text/calendar;charset=utf8,' + [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            'URL:' + document.URL,
            'DTSTART:' + (startTime || ''),
            'DTEND:' + (endTime || ''),
            'SUMMARY:' + (event.title || ''),
            'DESCRIPTION:' + (event.description || ''),
            'LOCATION:' + (event.address || ''),
            'END:VEVENT',
            'END:VCALENDAR'].join('\n'));
        return '<a class="' + eClass + '" target="_blank" href="' + href + '">' + calendarName + ' Calendar</a>';
      },

      ical: function(event) {
        return this.ics(event, 'icon-ical', 'iCal');
      },

      outlook: function(event) {
        return this.ics(event, 'icon-outlook', 'Outlook');
      }
    };

    var GENERATORS = function(event) {
      return {
        google: calendarGenerators.google(event),
        yahoo: calendarGenerators.yahoo(event),
        ical: calendarGenerators.ical(event),
        outlook: calendarGenerators.outlook(event)
      };
    };

    var result = document.createElement('div');
    var calendarId = (params.options && params.options.id) ? params.options.id : Math.floor(Math.random() * 1000000); // Generate a 6-digit random ID

    // Make sure we have the necessary event data, such as start time and event duration
    if (params.data && params.data.start && (params.data.end || params.data.duration)) {

      result.innerHTML = '<label for="checkbox-for-' + calendarId + '" class="add-to-calendar-checkbox">+ Add to my Calendar</label>' ;
      result.innerHTML += '<input name="add-to-calendar-checkbox" class="add-to-calendar-checkbox" id="checkbox-for-' + calendarId + '" type="checkbox">';

      var generatedCalendars = GENERATORS(params.data);

      Object.keys(generatedCalendars).forEach(function(services) {
        result.innerHTML += generatedCalendars[services];
      });

    } else {
      console.log('Event details missing.');
      return;
    }

    // Add Class and ID to div if either one is passed as an option
    result.className = 'add-to-calendar' + ((params.options && params.options.class) ? (' ' + params.options.class) : '');
    result.id = calendarId;

    return result;
  };
})(this);
