(function() {
  "use strict";

  var user_id = null; // hard-code id for testing, need sessions

  window.addEventListener("load", initialize);

  function initialize() {
    $("search").addEventListener("click", search);
  }

  function search() {
    let placeName = $("placeName").value === "Place Name" ? "" : $("placeName").value;
    let placeType = $("placeType").value === "Place Type" ? "" : $("placeType").value;

    let url = "./search?placeName=" + placeName + "&placeType=" + placeType;
    let req = JSON.stringify({});
    ajax("GET", url, req, successSearch, showError);
  }

  function successSearch(response) {
    var places = JSON.parse(response);
    if (!places || places.length === 0) {
      showError("No requested places");
    } else {
      console.log(places[0]);
      listPlaces(places);
    }
  }

  /**
   * List places
   *
   * @param response -
   *            An array of place JSON objects
   */
  function listPlaces(places) {
    let ul = $("place-list");
    ul.innerHTML = '';
    for (let i = 0; i < places.length; i++) {
      createLi(ul, places[i]);
    }
  }

  function showError(msg) {
    $("place-list").innerHTML = "";
    let p = gen("p");
    p.innerText = msg;
    $("place-list").appendChild(p);
  }

// //////////// HELPER FUNCTION
  /**
   * Add place to the list
   *
   * @param ul -
   *            The
   *            <ul id="place-list">
   *            tag
   * @param place -
   *            The place data (JSON object)
   */
  function createLi(ul, place) {
    // name, rating, address, icon, favorite
    // addeventlistener to fav
    let place_id = place.place_id;
    let li = gen("li");
    li.id = "place-" + place_id;
    li.className = "place";

    li.dataset.favorite = place.favorite;
    li.dataset.place_id = place_id;

    // icon
    let icon = gen("img");
    if (place.photos.length == 0) {
      icon.src = "https://twinscards.com/assets/no-image.jpg";
    } else {
      icon.src = place.photos[0];
    }
    li.appendChild(icon);

    // section
    let section = gen("div");

    // name
    let name = gen("p");
    name.innerHTML = place.name;
    name.className = "place-name";
    section.appendChild(name);

    // types
    let type = gen("p");
    type.className = "place-category";
    type.innerHTML = 'Category: ' + place.types.join(', ');
    section.appendChild(type);

    // rating
    let rating = gen("div"); 
    rating.className = "rating";
    for (let i = 1; i < place.rating; i++) {
      let star = gen("i");
      star.className = 'fa fa-star';
      rating.appendChild(star);
    }
    if (('' + place.rating).match(/\.5$/)) {
        let halfStar = gen("i");
        halfStar.classList.add("fa");
        halfStar.classList.add("fa-star-half-o");
        rating.appendChild(halfStar);
    }
    section.appendChild(rating);
    li.appendChild(section);

    // detail, might be deleted
    let detail = gen("p");
    detail.innerHTML = "Details";
    detail.className = "place-detail";
    li.appendChild(detail);

    // address
    let address = gen("p");
    address.className = "place-address";
    address.innerHTML = place.address;
    li.appendChild(address);

    // favorite link
    let favLink = gen("p");
    favLink.className = 'fav-link';

    let i = gen("i");
    i.id = 'fav-icon-' + place_id;
    i.className = place.favorite ? "fa fa-heart" : "fa fa-heart-o";
    favLink.appendChild(i);

    favLink.onclick = function() {
      changeFavorite(place_id);
    };
    li.appendChild(favLink);

    ul.appendChild(li);
  }

  function changeFavorite(place_id) {
   let li = $("place-" + place_id);
   let fav = $('fav-icon-' + place_id);
   let favorite = li.dataset.favorite !== "true";

   var url = "./favorite";
   if (window.localStorage.getItem("status") === "loggedIn") {
      user_id = window.localStorage.getItem("user_id");
      console.log(user_id);
   }
   if (user_id === null) {
     window.alert("Please login to access your WistList");
     window.location = "./page/login.html"; // check if user has logged in or not                      
   }
   var req = JSON.stringify({
         user_id: user_id,
         favorite: [place_id]
     });
     var method = favorite ? "PUT" : "DELETE";
     ajax(method, url, req,
         // successful callback
         function(res) {
          var result = JSON.parse(res);
          if (result.result === "SUCCESS for Adding into favorite list") {
            li.dataset.favorite = favorite;
            fav.className = favorite ? 'fa fa-heart' : 'fa fa-heart-o';
          }
     });
  }

//  function addToFavorite() {
//// 标记成 favorite : true;
//// 调用一个 ajax PUT → PlaceFavorite
//    var halfstar = $('fav-icon-' + placeid);
//    var favorite = li.dataset.favorite;
//      var url = './favorite';
//      var req = JSON.stringify({
//          user_id: user_id,
//          favorite: [place_id]
//      });
//      ajax('POST', url, req,
//              // successful callback
//              function(res) {
//                  var result = JSON.parse(res);
//                  if (result.result === 'SUCCESS') {
//                      li.dataset.favorite = favorite;
//                      favIcon.className = 'fa fa-heart';
//                  }
//              });
//
//  }
//
//  function removeFavorite() {
//// 标记成 favorite : false;
//// 调用一个 ajax DELETE → PlaceFavorite
//    var favIcon = $('fav-icon-' + placeid);
//    var favorite = li.dataset.favorite;
//      var url = './favorite';
//      var req = JSON.stringify({
//          user_id: user_id,
//          favorite: [place_id]
//      });
//      ajax('DELETE', url, req,
//              // successful callback
//              function(res) {
//                  var result = JSON.parse(res);
//                  if (result.result === 'SUCCESS') {
//                      li.dataset.favorite = favorite;
//                      favIcon.className = 'fa fa-heart-o';
//                  }
//              });
//
//  }

  /**
   * return the dom node of the given id
   *
   * @param {string}
   *            id - id of the element
   * @return {node} - dom node of the given id
   */
  function $(id) {
    return document.getElementById(id);
  }

/*
 * Returns a new DOM element with the given tag name (if one exists). If el is
 * not a correct tag name, returns undefined. @param {string} el - tag name
 * @return {object} newly-created DOM object of given tag type
 */
  function gen(el) {
    return document.createElement(el);
  }


  function ajax(method, url, data, callback, errorHandler) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    xhr.onload = function() {
      if (xhr.status === 200) {
        callback(xhr.responseText);
      } else {
        errorHandler("Cannot load requested places.");
      }
    }

    xhr.onerror = function() {
      console.error("The request couldn't be completed");
      errorHandler("Cannot load requested places.");
    }

    if (data === null) {
      xhr.send();
    } else {
      xhr.setRequestHeader("Content-Type",
                     "application/json;charset=utf-8");
      xhr.send(data);
    }
  }

})();