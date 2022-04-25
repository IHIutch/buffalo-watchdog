import supabase from '../../util/supabase'

const handler = async (req, res) => {
  const { method } = req
  const { disposition } = req.body

  switch (method) {
    // Update
    case 'PUT':
      try {
        const { id, ...rest } = disposition
        const { data, error } = await supabase
          .from('disposition_types')
          .update({ ...rest })
          .eq('id', id)
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
          .from('disposition_types')
          .insert(disposition)
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
