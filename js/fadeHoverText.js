function fadeText(fadeTo, evt) {
    if (evt.target.id.endsWith("-button")) {
        children = $("div#button-text").children("p");
        children.stop();
        if (fadeTo === 1) children.fadeOut(0);
        $("#" + evt.target.id.replace("-button", "-text")).fadeTo(400, fadeTo);
    }
}

$(function() {
    $("a.button").hover(fadeText.bind(this, 1), fadeText.bind(this, 0));
});