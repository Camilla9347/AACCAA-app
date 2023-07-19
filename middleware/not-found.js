const notFound = (req, res) => res.status(404).send('Route does not exist')

// no next here: once we hit 404, we are done! 
// the requested route does not exist in this project

module.exports = notFound
