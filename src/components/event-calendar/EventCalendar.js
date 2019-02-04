import React, { Component } from "react";
import moment from "moment";
import { Panel, Grid, Row, Col } from "react-bootstrap";
import BigCalendar from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { uuid } from "../../flow/io/eventFN";
let localizer = BigCalendar.momentLocalizer(moment);
let allViews = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k]);

class EventCalendar extends Component {
  constructor(props) {
    super(props);
    this.bound = [
      "handleHideInstructions",
      "handleAddEvent",
      "handleEditEvent",
      "handleViewAllCalendars",
      "handleAddCalendarByFile"
    ].reduce((acc, d) => {
      acc[d] = this[d].bind(this);
      return acc;
    }, {});
    this.fileInput = React.createRef();
  }

  componentWillMount() {
    this.props.initializeLazyActions();
  }

  handleHideInstructions() {
    this.props.hideInstructions();
  }

  handleViewAllCalendars() {
    this.props.showAllCalendars();
  }

  handleEditEvent(event) {
    const { pickEventModal } = this.props;
    var eventType;
    if (event.mode === "read-only") {
      eventType = "view";
    } else {
      eventType = "edit";
    }
    pickEventModal({
      eventType,
      eventInfo: event
    });
  }

  handleAddEvent(slotInfo) {
    const { pickEventModal } = this.props;
    slotInfo.uid = uuid();
    pickEventModal({
      eventType: "add",
      eventInfo: slotInfo
    });
  }

/*
  handleAddCalendarByUrl(event) {
    if (event.key === "Enter") {
      const { showSettingsAddCalendar } = this.props;
      showSettingsAddCalendar(event.target.value);
    }
  }
*/

  handleAddCalendarByFile(event) {
    event.preventDefault();
    alert(
      `Selected file - ${
        this.fileInput.current.files[0].name
      }`
    );
  }

  eventStyle(event, start, end, isSelected) {
    var bgColor = event && event.hexColor ? event.hexColor : "#265985";
    var style = {
      backgroundColor: bgColor,
      borderRadius: "5px",
      opacity: 1,
      color: "white",
      border: "0px",
      display: "block"
    };
    return {
      style: style
    };
  }

  getEventStart(eventInfo) {
    return eventInfo ? new Date(eventInfo.start) : new Date();
  }

  getEventEnd(eventInfo) {
    return eventInfo ? new Date(eventInfo.end) : new Date();
  }

  render() {
    console.log("[EventCalendar.render]", this.props);
    const {
      signedIn,
      views,
      myPublicCalendar,
      myPublicCalendarIcsUrl,
      publicCalendar,
      publicCalendarEvents,
      showGeneralInstructions,
      eventModal,
      inviteSuccess
    } = this.props;
    const { EventDetails } = views;
    const {
      handleHideInstructions,
      handleEditEvent,
      handleAddEvent,
      handleViewAllCalendars,
      handleAddCalendarByFile
    } = this.bound;

    let events = Object.values(this.props.events.allEvents);
    let shareUrl = null;
    if (myPublicCalendar) {
      events = events.filter(e => e.public && e.calendarName === "default");
      shareUrl =
        window.location.origin + "/?intent=view&name=" + myPublicCalendar;
    } else if (publicCalendarEvents) {
      events = publicCalendarEvents;
      shareUrl =
        window.location.origin + "/?intent=addics&url=" + publicCalendar;
    }
    const calendarView = (
      <BigCalendar
        localizer={localizer}
        selectable={this.props.signedIn && !myPublicCalendar && !publicCalendar}
        events={events}
        views={allViews}
        step={60}
        showMultiDayTimes
        defaultDate={new Date(moment())}
        onSelectEvent={event => handleEditEvent(event)}
        onSelectSlot={slotInfo => handleAddEvent(slotInfo)}
        style={{ minHeight: "500px" }}
        eventPropGetter={this.eventStyle}
        startAccessor={this.getEventStart}
        endAccessor={this.getEventEnd}
      />
    );

    return (
      <div className="bodyContainer">
        {signedIn &&
          showGeneralInstructions &&
          !myPublicCalendar &&
          !publicCalendar && (
            <Panel>
              <Panel.Heading>
                Instructions
                <button
                  type="button"
                  className="close"
                  onClick={handleHideInstructions}
                >
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Close</span>
                </button>
              </Panel.Heading>
              <Panel.Body>
                <Grid style={{ width: "100%" }}>
                  <Row style={{ textAlign: "left" }}>
                    <Col md={6}>
                      <strong>To add an event: </strong> Click or long-press on
                      the day you want to add an event or drag up to the day you
                      want to add the event for multiple day event! <br />
                    </Col>
                    <Col md={6}>
                      <strong>To update and delete an event:</strong> Click on
                      the event you wish to update or delete!
                    </Col>
                  </Row>
                  <Row style={{ textAlign: "left" }}>
                    <Col xs={12} sm={2} style={{ textAlign: "center" }}>
                      <img
                        src="/images/gcalendar.png"
                        width="48px"
                        height="48px"
                        alt="Google Calendar"
                      />
                    </Col>
                    <Col xs={12} sm={10}>
                      <strong>Move from Google Calendar</strong>: Done in a
                      minute! Follow the{" "}
                      <a href="https://github.com/friedger/oi-calendar">
                        2-steps tutorial
                      </a>
                      .
                      <br />

                      <form onSubmit={this.handleAddCalendarByFile}>
                        <label>
                          Upload .ics calendar file:
                          <input type="file" ref={this.fileInput} />
                        </label>
                        <br />
                        <button type="submit">Submit</button>
                      </form>

                    </Col>
                  </Row>
                </Grid>
              </Panel.Body>
            </Panel>
          )}
        {!signedIn && (
          <Panel>
            <Panel.Heading>
              Private, Encrypted Calendar in the Cloud
            </Panel.Heading>
            <Panel.Body>
              <strong>To learn about Blockstack: </strong> A good starting point
              is{" "}
              <a href="https://docs.blockstack.org">
                Blockstack's documentation
              </a>
              .<br />
              <strong>I have already a Blockstack ID:</strong> Just sign in
              using the blockstack button above!
            </Panel.Body>
          </Panel>
        )}
        {eventModal && !inviteSuccess && <EventDetails />}
        {(myPublicCalendar || publicCalendar) && (
          <Panel>
            <Panel.Heading>
              Public Calendar {myPublicCalendar}
              {publicCalendar}
              <button
                type="button"
                className="close"
                onClick={handleViewAllCalendars}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Close</span>
              </button>
            </Panel.Heading>
            {myPublicCalendar && events.length > 0 && (
              <Panel.Body>
                Share this url: <a href={shareUrl}>{shareUrl}</a>
                {myPublicCalendarIcsUrl && (
                  <span>
                    {" "}
                    or <a href={myPublicCalendarIcsUrl}> as .ics file</a>
                  </span>
                )}
              </Panel.Body>
            )}
            {myPublicCalendar && events.length === 0 && (
              <Panel.Body>
                No public events yet. Start publishing your events!
              </Panel.Body>
            )}
            {publicCalendar && events.length > 0 && signedIn && (
              <Panel.Body>
                <a href={shareUrl}>Add to my calandars</a>
              </Panel.Body>
            )}
            <Panel.Body>{calendarView}</Panel.Body>
          </Panel>
        )}
        {!myPublicCalendar && !publicCalendar && calendarView}
      </div>
    );
  }
}

export default EventCalendar;
