$("#postTextarea").keyup((event) => {
  const value = event.target.value.trim();
  if (value) {
    $("#submitPostButton").prop("disabled", false);
    return;
  }
  $("#submitPostButton").prop("disabled", true);
});

$("#submitPostButton").click((event) => {
  const button = $(event.target);
  const textbox = $("#postTextarea");

  const data = {
    content: textbox.val(),
  };

  $.post("/api/posts", data, (postData) => {
    let post = createPostHtml(postData);
    $(".postsContainer").prepend(post);
    textbox.val("");
    button.prop("disabled", true);
  });
});

$(document).on("click",".likedButton" ,() => {
    alert('clickd')
  });

function createPostHtml(postData) {
  const postedBy = postData.postedBy;

  if (postedBy._id === undefined) {
  }
  const diplayName = postedBy.firstName + " " + postedBy.lastName;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  return `<div class="post">
                <div class="mainContentContainer">
                    <div class="userImageContainer">
                        <img src='${postedBy.profilePic}'/>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class="displayName">
                                ${diplayName}
                            </a>
                            <span class="username">
                                @${postedBy.username}
                            </span>
                            <span class="date">
                                ${timestamp}
                            </span>
                            
                        </div>
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>

                            <div class="postButtonContainer">
                                <button>
                                    <i class="fa-regular fa-comment"></i>                                
                                </button>
                            </div>

                            <div class="postButtonContainer">
                                <button>
                                    <i class="fa-solid fa-retweet"></i>                                
                                </button>
                            </div>

                            <div class="postButtonContainer">
                                <button class="likedButton">
                                    <i class="fa-regular fa-heart"></i>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just now";
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}
