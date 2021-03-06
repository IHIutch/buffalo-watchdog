import supabase from "../../util/supabase";

export default async (req, res) => {
  const { method } = req;

  switch (method) {
    // Create
    case "POST":
      const { allegations } = req.body;
      try {
        const { data, error } = await supabase
          .from("allegations")
          .insert(allegations);
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
