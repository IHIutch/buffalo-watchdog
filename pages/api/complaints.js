import supabase from "../../util/supabase";

export default async (req, res) => {
  const { method } = req;
  const { complaint } = req.body;

  switch (method) {
    // Update
    case "PUT":
      try {
        const { id, ...rest } = complaint;
        const { data, error } = await supabase
          .from("complaint_types")
          .update({ ...rest })
          .eq("id", id);
        if (error) {
          console.log(error);
          throw new Error(error);
        }
        res.status(200).json(data);
      } catch (error) {
        res.status(400).json(error);
      }
      break;

    // Create
    case "POST":
      try {
        const { data, error } = await supabase
          .from("complaint_types")
          .insert(complaint);
        if (error) {
          throw new Error(error);
        }
        res.status(200).json(data);
      } catch (error) {
        res.status(400).json(error);
      }
      break;
    default:
      res.setHeader("Allow", ["PUT", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
