import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/HomeInspectionReport.css";
import "../styles/InspectionWorksheets.css";

const Summary = () => {
  const { propertyId, inspectionId } = useParams();
  const [propertyData, setPropertyData] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);
  const [photosByItem, setPhotosByItem] = useState({});
  const [sectionData, setSectionData] = useState({});

  const sections = useMemo(() => [
    "roof",
    "exterior",
    "basementFoundation",
    "heating",
    "cooling",
    "plumbing",
    "electrical",
    "attic",
    "doorsWindows",
    "fireplace",
    "systemsComponents",
  ], []);

  const sectionTitles = {
    roof: "ROOFING",
    exterior: "EXTERIOR",
    basementFoundation: "STRUCTURAL COMPONENTS",
    heating: "HVAC - HEATING",
    cooling: "HVAC - COOLING",
    plumbing: "PLUMBING SYSTEM",
    electrical: "ELECTRICAL SYSTEM",
    attic: "ATTIC",
    doorsWindows: "DOORS & WINDOWS",
    fireplace: "FIREPLACE",
    systemsComponents: "SYSTEMS & COMPONENTS",
  };

//   const sectionDescriptions = {
//     roof: "<p class='question intro-description'>DESCRIPTION</p><p class='desc-desc'><strong> The inspector shall inspect from ground level or eaves: </strong>The roof covering. The gutters. The downspouts. The vents, flashings, skylights, chimney and other roof penetrations. The general structure of the roof from the readily accessible panels, doors or stairs.</p><p class='desc-desc'><strong>The inspector is not required to: </strong>Walk on any roof surface, predict the service life expectancy, inspect underground downspout diverter drainage pipes, remove snow, ice, debris or other conditions that prohibit the observation of the roof surfaces, move insulation, inspect antennae, satellite dishes, lightning arresters, de-icing equipment, or similar attachments. Walk on any roof areas that appear, in the opinion of the inspector to be unsafe, and or cause damage. Perform a water test, warrant or certify the roof. Confirm proper fastening or installation of any roof material.</p>",
//     exterior: "<p class=‘question intro-description’>DESCRIPTION</p><p class='desc-desc'><strong>The inspector shall inspect from ground level or eaves: </strong>The siding, flashing and trim. All exterior doors, decks, stoops, steps, stairs, porches, railings, eaves, soffits and fascias. And report as in need of repair any spacing between intermediate balusters, spindles, or rails for steps, stairways, balconies, and railings that permit the passage of an object greater than four inches in diameter. A representative number of windows. The vegetation, surface drainage and retaining walls when these are likely to adversely affect the structure. And describe the exterior wall covering.</p><p class='desc-desc'><strong>The inspector is not required to: </strong>Inspect or operate screens, storm windows, shutters, awnings, fences, outbuildings, or exterior accent lighting, Inspect items, including window and door flashings, which are not visible or readily accessible from the ground, Inspect geological, geotechnical, hydrological and/or soil conditions, Inspect recreational facilities, playground equipment. Inspect seawalls, break-walls and docks, Inspect erosion control and earth stabilization measures, Inspect for safety type glass, Inspect underground utilities, Inspect underground items, Inspect wells or springs, Inspect solar, wind or geothermal systems, Inspect swimming pools or spas, Inspect wastewater treatment systems septic systems or cesspools, Inspect irrigation or sprinkler systems, Inspect drain fields or drywells, Determine the integrity of multi-pane window glazing or the thermal window seals.</p>",
//     basementFoundation: "<p class=‘question intro-description’>DESCRIPTION</p><p class='desc-desc'><strong>The inspector shall inspect from ground level or eaves: </strong>The basement. The foundation. The crawlspace. The visible structural components. Any present conditions or clear indications of active water penetration observed by the inspector. And report any general indications of foundation movement that are observed by the inspector, such as but not limited to sheetrock cracks, brick cracks, out-of-square door frames or floor slopes.</p><p class='desc-desc'><strong>The inspector is not required to: </strong>Enter any crawlspaces that are not readily accessible or where entry could cause damage or pose a hazard to the inspector, Move stored items or debris, Operate sump pumps with inaccessible floats, Identify size, spacing, span, location or determine adequacy of foundation bolting, bracing, joists, joist spans or support systems, Provide any engineering or architectural service, Report on the adequacy of any structural system or component.</p>",
//     heating: "<p class=‘question intro-description’>DESCRIPTION</p><p class='desc-desc'><strong>The inspector shall inspect from ground level or eaves: </strong>The heating system and describe the energy source and heating method using normal operating controls. And report as in need of repair electric furnaces which do not operate. And report if inspector deemed the furnace inaccessible. The central cooling equipment using normal operating controls. The fireplace, and open and close the damper door if readily accessible and operable. Hearth extensions and other permanently installed components. And report as in need of repair deficiencies in the lintel, hearth and material surrounding the fireplace, including clearance from combustible materials.</p><p class='desc-desc'><strong>The inspector is not required to: </strong>Inspect or evaluate interiors of flues or chimneys, fire chambers, heat exchangers, humidifiers, dehumidifiers, electronic air filters, solar heating systems, solar heating systems or fuel tanks. Inspect underground fuel tanks. Determine the uniformity, temperature, flow, balance, distribution, size, capacity, BTU, or supply adequacy of the heating system. Light or ignite pilot flames. Activate heating, heat pump systems, or other heating systems when ambient temperatures or when other circumstances are not conducive to safe operation or may damage the equipment. Override electronic thermostats. Evaluate fuel quality. Verify thermostat calibration, heat anticipation or automatic setbacks, timers, programs or clocks. Determine the uniformity, temperature, flow, balance, distribution, size, capacity, BTU, or supply adequacy of the cooling system. Inspect window units, through-wall units, or electronic air filters. Operate equipment or systems if exterior temperature is below 60 degrees Fahrenheit or when other circumstances are not conducive to safe operation or may damage the equipment. Inspect or determine thermostat calibration, heat anticipation or automatic setbacks or clocks. Examine electrical current, coolant fluids or gasses, or coolant leakage. Inspect the flue or vent system. Inspect the interior of chimneys or flues, fire doors or screens, seals or gaskets, or mantels. Determine the need for a chimney sweep. Operate gas fireplace inserts. Light pilot flames. Determine the appropriateness of such installation. Inspect automatic fuel feed devices. Inspect combustion and/or make-up air devices. Inspect heat distribution assists whether gravity controlled or fan assisted. Ignite or extinguish fires. Determine draft characteristics. Move fireplace inserts, stoves, or firebox contents. Determine adequacy of draft, perform a smoke test or dismantle or remove any component. Perform an NFPA inspection. Perform a Phase 1 fireplace and chimney inspection.</p>",
//     cooling: "<p class=‘question intro-description’>DESCRIPTION</p><p class='desc-desc'><strong>The inspector shall inspect from ground level or eaves: </strong>The heating system and describe the energy source and heating method using normal operating controls. And report as in need of repair electric furnaces which do not operate. And report if inspector deemed the furnace inaccessible. The central cooling equipment using normal operating controls. The fireplace, and open and close the damper door if readily accessible and operable. Hearth extensions and other permanently installed components. And report as in need of repair deficiencies in the lintel, hearth and material surrounding the fireplace, including clearance from combustible materials.</p><p class='desc-desc'><strong>The inspector is not required to: </strong>Inspect or evaluate interiors of flues or chimneys, fire chambers, heat exchangers, humidifiers, dehumidifiers, electronic air filters, solar heating systems, solar heating systems or fuel tanks. Inspect underground fuel tanks. Determine the uniformity, temperature, flow, balance, distribution, size, capacity, BTU, or supply adequacy of the heating system. Light or ignite pilot flames. Activate heating, heat pump systems, or other heating systems when ambient temperatures or when other circumstances are not conducive to safe operation or may damage the equipment. Override electronic thermostats. Evaluate fuel quality. Verify thermostat calibration, heat anticipation or automatic setbacks, timers, programs or clocks. Determine the uniformity, temperature, flow, balance, distribution, size, capacity, BTU, or supply adequacy of the cooling system. Inspect window units, through-wall units, or electronic air filters. Operate equipment or systems if exterior temperature is below 60 degrees Fahrenheit or when other circumstances are not conducive to safe operation or may damage the equipment. Inspect or determine thermostat calibration, heat anticipation or automatic setbacks or clocks. Examine electrical current, coolant fluids or gasses, or coolant leakage. Inspect the flue or vent system. Inspect the interior of chimneys or flues, fire doors or screens, seals or gaskets, or mantels. Determine the need for a chimney sweep. Operate gas fireplace inserts. Light pilot flames. Determine the appropriateness of such installation. Inspect automatic fuel feed devices. Inspect combustion and/or make-up air devices. Inspect heat distribution assists whether gravity controlled or fan assisted. Ignite or extinguish fires. Determine draft characteristics. Move fireplace inserts, stoves, or firebox contents. Determine adequacy of draft, perform a smoke test or dismantle or remove any component. Perform an NFPA inspection. Perform a Phase 1 fireplace and chimney inspection.</p>",
//     plumbing: "<p class=‘question intro-description’>DESCRIPTION</p><p class='desc-desc'><strong>The inspector shall inspect from ground level or eaves: </strong>Verify the presence of and identify the location of the main water shutoff valve. Inspect the water heating equipment, including combustion air, venting, connections, energy sources, seismic bracing, and verify the presence or absence of temperature-pressure relief valves and/or Watts 210 valves. Flush toilets. Run water in sinks, tubs, and showers. Inspect the interior water supply including all fixtures and faucets. Inspect the drain, waste and vent systems, including all fixtures. Describe any visible fuel storage systems. Inspect the drainage sump pumps testing sumps with accessible floats. Inspect and describe the water supply, drain, waste and main fuel shut-off valves, as well as the location of the water main and main fuel shut-off valves. Inspect and determine if the water supply is public or private. Inspect and report as in need of repair deficiencies in the water supply by viewing the functional flow in two fixtures operated simultaneously. Inspect and report as in need of repair deficiencies in installation and identification of hot and cold faucets. Inspect and report as in need of repair mechanical drain-stops that are missing or do not operate if installed in sinks, lavatories and tubs. Inspect and report as in need of repair commodes that have cracks in the ceramic material, are improperly mounted on the floor, leak, or have tank components which do not operate.</p><p class='desc-desc'><strong>The inspector is not required to: </strong>Light or ignite pilot flames. Determine the size, temperature, age, life expectancy or adequacy of the water heater. Inspect interiors of flues or chimneys, water softening or filtering systems, well pumps or tanks, safety or shut-of valves, floor drains, lawn sprinkler systems or fire sprinkler systems. Determine the exact flow rate, volume, pressure, temperature, or adequacy of the water supply. Determine the water quality or potability or the reliability of the water supply or source. Open sealed plumbing access panels. Inspect clothes washing machines or their connections. Operate any main, branch or fixture valve. Test shower pans, tub and shower surrounds or enclosures for leakage. Evaluate the compliance with local or state conservation or energy standards, or the proper design or sizing of any water, waste or venting components, fixtures or piping. Determine the effectiveness of anti-siphon, back-flow prevention or drain-stop devices. Determine whether there are sufficient clean-outs for effective cleaning of drains. Evaluate gas, liquid propane or oil storage tanks. Inspect any private sewage waste disposal system or component of. Inspect water treatment systems or water filters. Inspect water storage tanks, pressure pumps or bladder tanks. Evaluate time to obtain hot water at fixtures, or perform testing of any kind to water heater elements. Evaluate or determine the adequacy of combustion air. Test, operate, open or close safety controls, manual stop valves and/or temperature or pressure relief valves. Examine ancillary systems or components, such as, but not limited to, those relating to solar water heating, hot water circulation.</p>",
//     electrical: "<p class=‘question intro-description’>DESCRIPTION</p><p class='desc-desc'><strong>The inspector shall inspect from ground level or eaves: </strong>The service line. The meter box. The main disconnect. And determine the rating of the service amperage. Panels, breakers and fuses. The service grounding and bonding. A representative sampling of switches, receptacles, light fixtures, AFCI receptacles and test all GFCI receptacles and GFCI circuit breakers observed and deemed to be GFCI's during the inspection. And report the presence of solid conductor aluminum branch circuit wiring if readily visible. And report on any GFCI-tested receptacles in which power is not present, polarity is incorrect, the receptacle is not grounded, is not secured to the wall, the cover is not in place, the ground fault circuit interrupter devices are not properly installed or do not operate properly, or evidence of arcing or excessive heat is present. The service entrance conductors and the condition of their sheathing. The ground fault circuit interrupters observed and deemed to be GFCI's during the inspection with a GFCI tester. And describe the amperage rating of the service. And report the absence of smoke detectors. Service entrance cables and report as in need of repair deficiencies in the integrity of the insulation, drip loop, or separation of conductors at weatherheads and clearances.</p><p class='desc-desc'><strong>The inspector is not required to: </strong>Insert any tool, probe or device into the main panel, sub-panels, downstream panel, or electrical fixtures. Operate electrical systems that are shut down. Remove panel covers or dead front covers if not readily accessible. Operate over current protection devices. Operate non-accessible smoke detectors. Measure or determine the amperage or voltage of the main service if not visibly labeled. Inspect the alarm system and components. Inspect the ancillary wiring or remote control devices. Activate any electrical systems or branch circuits which are not energized. Operate overload devices. Inspect low voltage systems, electrical de-icing tapes, swimming pool wiring or any time-controlled devices. Verify the continuity of the connected service ground. Inspect private or emergency electrical supply sources, including but not limited to generators, windmills, photovoltaic solar collectors, or battery or electrical storage facility. Inspect spark or lightning arrestors. Conduct voltage drop calculations. Determine the accuracy of breaker labeling. Inspect exterior lighting.</p>",
//     attic: "<p class=‘question intro-description’>DESCRIPTION</p><p class='desc-desc'><strong>The inspector shall inspect from ground level or eaves: </strong>Insulation and vapor retarders in unfinished spaces; Ventilation of attics and foundation areas; Kitchen, bathroom, and laundry venting systems; and the operation of any readily accessible attic ventilation fan, and, when temperature permits, the operation of any readily accessible thermostatic control. The home inspector shall describe: Insulation in unfinished spaces; and Absence of insulation in unfinished space at conditioned surfaces. The home inspector shall: Move insulation where readily visible evidence indicates the need to do so; and Move insulation where chimneys penetrate roofs, where plumbing drain/waste pipes penetrate floors, adjacent to earth filled stoops or porches, and at exterior doors.</p><p class='desc-desc'><strong>The inspector is not required to: </strong>Concealed insulation and vapor retarders; or Venting equipment that is integral with household appliances.</p>",
//     doorsWindows: "<p class=‘question intro-description’>DESCRIPTION</p><p class='desc-desc'><strong>The inspector shall inspect from ground level or eaves: </strong>Open and close a representative number of doors and windows. Inspect the walls, ceilings, steps, stairways, and railings. Inspect garage doors and garage door openers by operating first by remote (if available) and then by the installed automatic door control. And report as in need of repair any installed electronic sensors that are not operable or not installed at proper heights above the garage door. And report as in need of repair any door locks or side ropes that have not been removed or disabled when garage door opener is in use. And report as in need of repair any windows that are obviously fogged or display other evidence of broken seals.</p><p class='desc-desc'><strong>The inspector is not required to: </strong>Inspect paint, wallpaper, window treatments or finish treatments. Inspect central vacuum systems. Inspect safety glazing. Inspect security systems or components. Evaluate the fastening of countertops, cabinets, sink tops and fixtures, or firewall compromises. Move furniture, stored items, or any coverings like carpets or rugs in order to inspect the concealed floor structure. Move drop ceiling tiles. Inspect or move any household appliances. Inspect or operate equipment housed in the garage except as otherwise noted. Verify or certify safe operation of any auto reverse or related safety function of a garage door. Operate or evaluate security bar release and opening mechanisms, whether interior or exterior, including compliance with local, state, or federal standards. Operate any system, appliance or component that requires the use of special keys, codes, combinations, or devices. Operate or evaluate self-cleaning oven cycles, tilt guards/latches or signal lights. Inspect microwave ovens or test leakage from microwave ovens. Operate or examine any sauna, steam-jenny, kiln, toaster, ice-maker, coffee-maker, can-opener, bread-warmer, blender, instant hot water dispenser, or other small, ancillary devices. Inspect elevators. Inspect remote controls. Inspect appliances. Inspect items not permanently installed. Examine or operate any above-ground, movable, freestanding, or otherwise non-permanently installed pool/spa, recreational equipment or self-contained equipment. Come into contact with any pool or spa water in order to determine the system structure or components. Determine the adequacy of spa jet water force or bubble effect. Determine the structural integrity or leakage of a pool or spa.</p>",
//     fireplace: "<p class='question intro-description'>DESCRIPTION</p><p class='desc-desc'>Reviews visible areas of fireplaces, chimneys, and vent systems for safety and function.</p>",
//     systemsComponents: "<p class='question intro-description'>DESCRIPTION</p><p class='desc-desc'>Covers built-in systems and miscellaneous components like garage doors and safety features.</p>",
//   };

  useEffect(() => {
    if (!inspectionId || !propertyId) return;
  
    const fetchData = async () => {
      try {
        const apiBase = "http://localhost:8080";
  
        // 1. Get address and inspection details
        const [addressRes, detailsRes] = await Promise.all([
          axios.get(`${apiBase}/api/get-address/${propertyId}`),
          axios.get(`${apiBase}/api/inspection-details/${inspectionId}/${propertyId}`)
        ]);
        const propertyDetailsRes = await axios.get(`${apiBase}/api/property-details/${propertyId}/${inspectionId}`);
            setPropertyData({
            ...addressRes.data,
            ...propertyDetailsRes.data,
        });
        setInspectionData(detailsRes.data);
  
        // 2. Get section data
        const sectionResults = await Promise.all(
          sections.map(section =>
            axios.get(`${apiBase}/api/inspection-${section}/${inspectionId}`)
              .then(res => ({ section, data: res.data || [] }))
              .catch(err => {
                console.error(`Error loading ${section} data:`, err);
                return { section, data: [] };
              })
          )
        );
        const sectionMap = {};
        sectionResults.forEach(({ section, data }) => {
          sectionMap[section] = data;
        });
        setSectionData(sectionMap);
  
        // 3. Get item photos grouped by item_name
        const photoRes = await axios.get(`${apiBase}/api/inspection-photo-all/${inspectionId}`);
        const groupedPhotos = {};
        const photos = Array.isArray(photoRes.data) ? photoRes.data : [];

        photos.forEach(photo => {
        if (!groupedPhotos[photo.item_name]) {
            groupedPhotos[photo.item_name] = [];
        }
        groupedPhotos[photo.item_name].push(photo);
        });
        setPhotosByItem(groupedPhotos);
  
      } catch (error) {
        console.error("Error fetching inspection report data:", error);
      }
    };
  
    fetchData();
  }, [inspectionId, propertyId, sections]);
  

  const renderItem = (item, indexPrefix) => {
    const itemName = item.item_name || item.itemName;
    const materialList = item.materials
      ? Object.keys(item.materials).filter(key => item.materials[key]).join(", ")
      : "";
    const conditionList = item.conditions
      ? Object.keys(item.conditions).filter(key => item.conditions[key]).join(", ")
      : "";

    return (
      <div className="inspection-item" key={itemName}>
        <h3 className="item-header">{indexPrefix} {itemName}</h3>

        <div className="item-details">
          {materialList && (
            <div className="item-block">
              <strong>Styles & Materials:</strong> {materialList}
            </div>
          )}
          {conditionList && (
            <div className="item-block">
              <strong>Condition:</strong> {conditionList}
            </div>
          )}
          
        </div>

        {item.comments && item.comments.trim() !== "" && (
            <div className="item-block">
              <strong>Observation:</strong> {item.comments}
            </div>
        )}

        {photosByItem[itemName] && (
          <div className="item-photos">
            <div className="photo-gallery">
              {photosByItem[itemName].map(photo => (
                <img
                  key={photo.photo_id}
                  src={`http://localhost:8080${photo.photo_url}`}
                  alt={itemName}
                  className="report-photo"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="report-wrapper">

      {propertyData && (
        <section className="report-summary">
            <h2 className="section-header property-info">PROPERTY INFO</h2>
            <div className="overview-grid">
            <div><strong>Property Type:</strong> {propertyData.property_type || "N/A"}</div>
            <div><strong>Year Built:</strong> {propertyData.year_built || "N/A"}</div>
            <div><strong>Square Footage:</strong> {propertyData.square_footage ? `${propertyData.square_footage} sq ft` : "N/A"}</div>
            <div><strong>Lot Size:</strong> {propertyData.lot_size ? `${propertyData.lot_size} acres` : "N/A"}</div>
            <div><strong>Bedrooms:</strong> {propertyData.bedrooms || "N/A"}</div>
            <div><strong>Bathrooms:</strong> {propertyData.bathrooms || "N/A"}</div>
            </div>
        </section>
      )}

      {inspectionData && (
        <section className="report-summary">
            <h2 className="section-header inspection-overview">INSPECTION OVERVIEW</h2>
            <div className="overview-grid">
            <div><strong>Inspection Date:</strong> {inspectionData.inspection_date}</div>
            <div><strong>Temperature:</strong> {inspectionData.temperature ? `${inspectionData.temperature}°F` : "N/A"}</div>
            <div><strong>Weather:</strong> {inspectionData.weather || "N/A"}</div>
            <div><strong>Ground Condition:</strong> {inspectionData.ground_condition || "N/A"}</div>
            <div><strong>Rain in Last 3 Days:</strong> {inspectionData.rain_last_three_days ? "Yes" : "No"}</div>
            <div><strong>Radon Test Performed:</strong> {inspectionData.radon_test ? "Yes" : "No"}</div>
            <div><strong>Mold Test Performed:</strong> {inspectionData.mold_test ? "Yes" : "No"}</div>
            </div>
        </section>
        )}

      {sections.reduce((acc, section) => {
        const data = sectionData[section];
        const hasPhotos = data?.some(item => photosByItem[item.item_name || item.itemName]);
        if ((!data || data.length === 0) && !hasPhotos) return acc;

        acc.push({ section, data });
        return acc;
      }, []).map((sectionInfo, visibleIdx) => {
        const { section, data } = sectionInfo;
        return (
          <section key={section} className="report-section">
            <h2 className="section-header">{`${visibleIdx + 1}. ${sectionTitles[section]}`}</h2>

            {/* {sectionDescriptions[section] && (
              <div
                className="section-description"
                dangerouslySetInnerHTML={{ __html: sectionDescriptions[section] }}
              />
            )} */}

            {data.map((item, idx) => {
              const prefix = `${visibleIdx + 1}.${idx + 1}`;
              return renderItem(item, prefix);
            })}
          </section>
        );
      })}

      <footer className="report-footer">
        <p>© Total Home Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Summary;