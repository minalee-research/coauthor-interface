function emptyDropdownMenu() {
  $('#frontend-overlay').empty();
}


function openDropdownMenu(source, is_reopen=false) {
  if ($('#frontend-overlay').hasClass('hidden')){
    $('#frontend-overlay').removeClass('hidden');
  }

  if (is_reopen == true) {
    logEvent(EventName.SUGGESTION_REOPEN, source);
  } else {
    logEvent(EventName.SUGGESTION_OPEN, source);
  }
}


function hideDropdownMenu(source) {
  if ($('#frontend-overlay').length && !$('#frontend-overlay').hasClass('hidden')){
    $('#frontend-overlay').addClass('hidden');
    $('.sudo-hover').removeClass('sudo-hover');  // NOTE Do not delete; error
    logEvent(EventName.SUGGESTION_CLOSE, source);
  }
}

function selectDropdownItem(suggestion){
  // Close dropdown menu after selecting new suggestion
  logEvent(EventName.SUGGESTION_SELECT, EventSource.USER);
  hideDropdownMenu(EventSource.API);
  appendText(suggestion);

  // Do not empty for metaphor generation
  if (domain != 'metaphor'){
    emptyDropdownMenu();
  }

}

function addToDropdownMenu(suggestion_with_probability) {
  let index = suggestion_with_probability['index'];
  let original = suggestion_with_probability['original'];
  let trimmed = suggestion_with_probability['trimmed'];
  let probability = suggestion_with_probability['probability'];
  let source = suggestion_with_probability['source'];  // Could be empty

  // Hide empty string suggestions
  if (trimmed.length > 0) {
    $('#frontend-overlay').append(function() {
      return $('<div class="dropdown-item" data-source="' + source + '">' + trimmed + '</div>').click(function(){
        currentHoverIndex = index;
        currentIndex = index;
        selectDropdownItem(original);
      }).mouseover(function(){
        currentHoverIndex = index;
        logEvent(EventName.SUGGESTION_HOVER, EventSource.USER);
      }).data('index', index).data('original', original).data('trimmed', trimmed).data('probability', probability).data('source', source);
    });
  }

}

function reverse_sort_by_probability(a, b) {
  if (a.probability > b.probability ){
    return -1;
  }
  if (a.probability < b.probability){
    return 1;
  }
  return 0;
}

function addSuggestionsToDropdown(suggestions_with_probabilities) {
  emptyDropdownMenu();

  // Reverse sort suggestions based on probability if it is set in config
  if (sortSuggestions == true){
    suggestions_with_probabilities.sort(reverse_sort_by_probability);
  }

  for (let i = 0; i < suggestions_with_probabilities.length; i++) {
    addToDropdownMenu(suggestions_with_probabilities[i]);
  }

  items = $('.dropdown-item');
  numItems = items.length;
  currentIndex = 0;
}

function showDropdownMenu(source, is_reopen=false) {
  // Check if there are entries in the dropdown menu
  if ($('#frontend-overlay').children().length == 0) {
    if (is_reopen == true) {
        alert('You can only reopen suggestions when none of them was selected before. Please press tab key to get new suggestions instead!');
    } else {
        alert('No suggestions to be shown. Press tab key to get new suggestions!');
    }
    return;
  }
  else {
    // Compute offset
    let offsetTop = $('#editor-view').offset().top;
    let offsetLeft = $('#editor-view').offset().left;
    let offsetBottom = $('footer').offset().top;

    let position = quill.getBounds(getText().length);
    let top = offsetTop + position.top + 60 + 40;  // + Height of toolbar + line height
    let left = offsetLeft + position.left;

    // Fit frontend-overlay to the contents
    let maxWidth = 0;
    let totalHeight = 0;
    let finalWidth = 0;
    $(".dropdown-item").each(function(){
        width = $(this).outerWidth(true);
        height = $(this).outerHeight(true);

        if (width > maxWidth) {
          maxWidth = width;
        }
        totalHeight = totalHeight + height;
    });
    finalWidth = Math.min(maxWidth, $('#editor-view').outerWidth(true));

    let rightmost = left + maxWidth;
    let bottommost = top + totalHeight;

    let width_overflow = rightmost > $("#editor-view").width();
    // Push it left if it goes outside of the frontend
    if (width_overflow) {
      left = offsetLeft + 30;  // 30px for padding
    }

    // Decide whether or not to move up the dropdown
    const bodyHeight = $('body').outerHeight(true);
    let moveUpDropdown = false;

    if (bottommost < ($("#editor-view").height() + 100)) {  // If it doesn't go over footer, no need to move up
    } else {  // If it does go over footer, then see whether moving up is easier
      if (top > (bodyHeight / 2)){
        moveUpDropdown = true;
      }
    }

    if (moveUpDropdown) {
      console.log('$("#editor-view").height(): ' + $("#editor-view").height());
      console.log('top: ' + top);
      console.log('offsetTop: ' + offsetTop);
      console.log('totalHeight: ' + totalHeight);

      // Adjust height
      var maxHeight = top - 100;
      if (totalHeight > maxHeight) {
        totalHeight = maxHeight;
      }

      // Set top
      top = top - totalHeight - 60;

    } else {
      // Set top
      top = top;

      // Adjust height
      var maxHeight = $("#editor-view").height() - offsetTop - position.top + 60;
      if (maxHeight < 100) {
        maxHeight = 100;
      }

      if (totalHeight > maxHeight){
        totalHeight = maxHeight;
      }

    }

    // Set top and left
    $('#frontend-overlay').css({
      top: top,
      left: left,
      height: totalHeight,
    });


    // Auto-select the first suggestion
    if (domain != 'story') {
      $('#frontend-overlay > .dropdown-item').first().addClass('sudo-hover');
    }


    openDropdownMenu(source, is_reopen);
  }


}
