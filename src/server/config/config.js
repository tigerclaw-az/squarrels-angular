module.exports = {
	/* eslint quotes: "off" */
	apiError: function(err) {
		if (!err) {
			err = "I'm sorry Dave, I'm afraid I can't do that.";
		}

		return {
			error: err
		}
	}
}
