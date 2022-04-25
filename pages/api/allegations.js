import supabase from '../../util/supabase'

const handler = async (req, res) => {
  const { method } = req

  const { allegations } = req.body

  switch (method) {
    // Update
    case 'PUT':
      try {
        const { data, error } = await supabase
          .from('allegations')
          .insert(allegations)
        if (error) {
          throw new Error(error)
        }
        res.status(200).json(data)
      } catch (error) {
        res.status(400).json(error)
      }
      break

    // Create
    case 'POST':
      try {
        const { data, error } = await supabase
          .from('allegations')
          .insert(allegations)
        if (error) {
          throw new Error(error)
        }
        res.status(200).json(data)
      } catch (error) {
        res.status(400).json(error)
      }
      break
    default:
      res.setHeader('Allow', ['PUT', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
