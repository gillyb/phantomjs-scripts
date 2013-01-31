var fs = require('fs');
var system = require('system');
    args = system.args;

var page;
var pageCount = 0;
 
scanPage(pageCount);
 
function scanPage(pageIndex) {
  // dispose of page before moving on
  if (typeof page !== 'undefined')
    page.release();

  // dispose of phantomjs if we're done
  if (pageIndex > args[2]) {
    phantom.exit();
    return;
  }

  pageIndex++;

  // start crawling...
  page = require('webpage').create();
  
  var currentPage = 'http://stackoverflow.com/users?page=' + pageIndex + '&tab=reputation&filter=all';

  page.open(currentPage, function(status) {
    if (status === 'success') {
      window.setTimeout(function() {
        console.log('crawling page ' + pageIndex);

        // scrape all users
        var usersInfo = page.evaluate(function() {
          var users = $('.user-info');

          var userInfoList = [];
          $.each(users, function(index, element) {
            var userDetails = $(element).find('.user-details');
            var userName = $(userDetails.find('a')[0]).html();
            var userLink = $(userDetails.find('a')[0]).attr('href');
            var userReputation = $(userDetails.find('.reputation-score')).html();
            var userLocation = $(userDetails.find('.user-location')).html();

            var userInfo = userReputation + '; ' + userName + '; ' + userLink + '; ' + userLocation;
            userInfoList.push(userInfo);
          });

          return userInfoList;
        });

        // console.log(usersInfo);

        // filter the users and save to file
        usersInfo.forEach(function(element, i) {
          if (element.toLowerCase().indexOf(args[1].toLowerCase()) !== -1) {
            console.log('saving to file : ' + element);
            fs.write('users.txt', element + '\n', 'a');
          }
        })

        scanPage(pageIndex);
      }, 3000);
    }
    else {
      console.log('error crawling page ' + pageIndex);
      page.release();
    }
  });
}