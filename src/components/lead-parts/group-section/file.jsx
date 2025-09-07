const PersonDropdown = ({ value, onChange, onSave, onCancel }) => {
    const [personOptions, setPersonOptions] = useState([]);
  
    useEffect(() => {
      const fetchPersons = async () => {
        try {
          const res = await getLeads();
          const options = res.data
            .filter((lead) => lead.person_detail)
            .map((lead) => ({
              id: lead.person_detail.id,
              name: lead.person_detail.fullname || "Unnamed Person",
              img: (() => {
                const picture = lead.person_detail.profile_picture;
                if (!picture) return null;
                const url = typeof picture === "string" ? picture : picture?.url;
                if (!url) return null;
                if (url.startsWith("http://") || url.startsWith("https://")) {
                  return url;
                }
                return `https://prototype-production-2b67.up.railway.app${url}`;
              })(),
            }));
          setPersonOptions(options);
        } catch (err) {
          console.error("Failed to fetch persons:", err);
        }
      };
      fetchPersons();
    }, []);
  
    const handleChange = async (selectedId) => {
      const selectedPerson =
        personOptions.find((p) => p.id === selectedId) || null;
      onChange(selectedPerson);
      onSave();
    };
  
    return (
      <Select
        value={value?.id || undefined}
        onChange={handleChange}
        onBlur={onSave}
        placeholder="Select Person"
        style={{ width: "100%", border: "none" }}
        className="ant-select-borderless custom-selectt"
        optionLabelProp="label"
      >
        {personOptions.map((person) => (
          <Select.Option
            key={person.id}
            value={person.id}
            label={person.name}
            style={{ border: "none" }}
          >
            <div className="flex items-center gap-2">
              {person.img && <Avatar size={24} src={person.img} />}
              <span>{person.name}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
    );
  };