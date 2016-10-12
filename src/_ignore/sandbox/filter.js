PatternPad.Fragment({
  methods: {
    _filter: function(options) {
      if (!options) options = {};

      if (!options.recommendations) options.recommendations = 3;
      if (!options.userIndex) options.userIndex = 0;
      if (!options.accuracy) options.accuracy = 3;

      // load file
      $.get('users.json').then(function(data) {

        // source objects
        var movies = fUtils.deepClone(data.movies),
          users = fUtils.deepClone(data.users),
          initialUser = fUtils.deepClone(users[options.userIndex]),
          weightedUsers = [];

        // weigh each user in relation to the intial user's movie favs
        users.forEach(function(user, index) {
          // exclude initial user
          if (user.user_id === initialUser.user_id) return;
          var weight = 0;

          user.movies.forEach(function(movie, index) {
            if (initialUser.movies.indexOf(movie) > -1) weight++;
          });

          weightedUsers.push({
            weight: weight,
            index: index
          });
        });

        // sort weighted users in descending order based on weight
        weightedUsers.sort(function(a, b) {
          if (a.weight > b.weight)
            return -1;
          if (a.weight < b.weight)
            return 1;
          return 0;
        });

        // pick number of users to compare based on accuracy
        // create initial shared movies array based on favs of first weighted user
        var weightedToCompare = weightedUsers.splice(0, options.accuracy),
          sharedMovies = fUtils.deepClone(users[weightedToCompare[0].index].movies);

        // find out what movies are shared by weighted users with highest
        // index but NOT shared by the initial user
        weightedToCompare.forEach(function(weighted, index) {
          var user = users[weighted.index],
            updatedSharedMovies = [];

          user.movies.forEach(function(movie, index) {
            if (sharedMovies.indexOf(movie) > -1
              && initialUser.movies.indexOf(movie) < 0) {
              updatedSharedMovies.push(movie);
            }
          });

          sharedMovies = updatedSharedMovies;
        });

        // pick number of recommendations based on options
        var recommendedMovies = sharedMovies.splice(0, options.recommendations);

        // print initial user and result
        console.log(initialUser);
        console.log(recommendedMovies);
      });
    }
  }
});