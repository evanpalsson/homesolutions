import React from 'react';
import '../styles/HomeInspectionReport.css';

const HomeInspectionReport = () => {
  return (
    <>
    <head>
        <meta charset="UTF-8"></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <title>Inspection Report</title>
        <link rel="stylesheet" href="styles.css"></link>
    </head>
    <body>
        <header>
            <h1>Inspection Report</h1>
            <p><strong>Property Address:</strong> 586 Mountain Fancy Drive, Big Lake NC 28715</p>
            <p><strong>Inspection Date:</strong> December 15, 2020</p>
            <p><strong>Inspector:</strong> Russell Buchanan</p>
        </header>

        <nav>
            <ul>
                <li><a href="#roofing">1. Roofing</a></li>
                <li><a href="#exterior">2. Exterior</a></li>
                <li><a href="#structural">3. Structural Components</a></li>
                <li><a href="#hvac">4. Heating / Central Air Conditioning</a></li>
                <li><a href="#plumbing">5. Plumbing System</a></li>
                <li><a href="#electrical">6. Electrical System</a></li>
                <li><a href="#insulation">7. Insulation and Ventilation</a></li>
                <li><a href="#interiors">8. Interiors</a></li>
                <li><a href="#garage">9. Garage</a></li>
                <li><a href="#appliances">10. Built-In Kitchen Appliances</a></li>
                <li><a href="#tour">11. Home Tour</a></li>
                <li><a href="#summary">Summary</a></li>
            </ul>
        </nav>

        <main>
        <section id="sec-id-Intro-Page">
            <h2>Intro Page</h2>
            <div class="intro-details">
                <p><strong>Property Address:</strong> 586 Mountain Fancy Drive, Big Lake NC 28715</p>
                <p><strong>Inspection Date:</strong> December 15, 2020</p>
                <p><strong>Inspector:</strong> Russell Buchanan</p>
                <p><strong>Report ID:</strong> 12345-Sample</p>
                <p><strong>Customer(s):</strong> Sample Buyer</p>
                <p><strong>Real Estate Agent:</strong> Nath Dau-Schmidt, DauSchmidt Realty</p>
                <p><strong>In Attendance:</strong> Customer and their agent</p>
                <p><strong>Type of Building:</strong> Single Family (2 story)</p>
                <p><strong>Approximate Age:</strong> Over 10 Years</p>
                <p><strong>Weather:</strong> Clear, Temperature Over 65°F</p>
                <p><strong>Ground/Soil Surface Condition:</strong> Dry</p>
                <p><strong>Rain in Last 3 Days:</strong> No</p>
                <p><strong>Radon Test:</strong> Yes</p>
                <p><strong>Water Test:</strong> No</p>
            </div>

            <div class="comment-key">
                <h3>Comment Key or Definitions</h3>
                <ul>
                    <li><strong>Inspected (IN):</strong> Visually observed the item, appeared functioning as intended.</li>
                    <li><strong>Not Inspected (NI):</strong> Item not inspected, reason will be stated.</li>
                    <li><strong>Not Present (NP):</strong> Item is not present in the property.</li>
                    <li><strong>Repair or Replace (RR):</strong> Item is not functioning as intended, needs repair or further inspection.</li>
                </ul>
            </div>

            <div class="report-summary">
                <h3>Report Summary</h3>
                <p>The following definitions of comment descriptions represent this inspection report. All comments by the inspector should be considered before purchasing this home. Recommendations by the inspector to repair or replace suggest a second opinion or further inspection by a qualified contractor. All costs associated with further inspection fees and repair or replacement should be considered before purchase.</p>
            </div>
        </section>

        {/* <!-- Roofing --> */}
        <section id="roofing">
            <h2>1. Roofing</h2>
            <p><strong>Roof Covering:</strong> Asphalt/Fiberglass</p>
            <p><strong>Inspection Method:</strong> Ground</p>
            <h3>Observations</h3>
            <ul>
                <li>Roof coverings: <span class="status inspected">Inspected</span></li>
                <li>Roof Drainage Systems: <span class="status repair">Repair or Replace</span>
                    <p>Drain line has sunken or pulled loose from downspout. This area needs repair.</p>
                </li>
            </ul>
        </section>

        {/* <!-- Exterior --> */}
        <section id="exterior">
            <h2>2. Exterior</h2>
            <p><strong>Inspection Areas:</strong> Siding, flashing, trim, doors, and vegetation.</p>
            <h3>Observations</h3>
            <ul>
                <li>Wall Cladding: <span class="status repair">Repair or Replace</span></li>
                <li>Doors: <span class="status repair">Repair or Replace</span></li>
            </ul>
        </section>

        {/* <!-- Structural Components --> */}
        <section id="structural">
            <h2>3. Structural Components</h2>
            <p><strong>Foundation Type:</strong> Masonry block</p>
            <h3>Observations</h3>
            <ul>
                <li>Walls: <span class="status repair">Repair or Replace</span></li>
            </ul>
        </section>

        {/* <!-- HVAC --> */}
        <section id="hvac">
            <h2>4. Heating / Central Air Conditioning</h2>
            <p><strong>Heating Type:</strong> Gas Furnace</p>
            <p><strong>Cooling Type:</strong> Air Conditioner</p>
            <h3>Observations</h3>
            <ul>
                <li>Air Handler: <span class="status repair">Repair or Replace</span></li>
            </ul>
        </section>

        {/* <!-- Plumbing --> */}
        <section id="plumbing">
            <h2>5. Plumbing System</h2>
            <p><strong>Water Source:</strong> Public</p>
            <h3>Observations</h3>
            <ul>
                <li>Drain Systems: <span class="status repair">Repair or Replace</span></li>
            </ul>
        </section>

        {/* <!-- Electrical --> */}
        <section id="electrical">
            <h2>6. Electrical System</h2>
            <p><strong>Panel Capacity:</strong> 200 AMP</p>
            <h3>Observations</h3>
            <ul>
                <li>Connected Devices: <span class="status repair">Repair or Replace</span></li>
            </ul>
        </section>

        {/* <!-- Insulation and Ventilation --> */}
        <section id="insulation">
            <h2>7. Insulation and Ventilation</h2>
            <p><strong>Attic Insulation:</strong> Blown Fiberglass</p>
            <h3>Observations</h3>
            <ul>
                <li>Insulation: <span class="status inspected">Inspected</span></li>
            </ul>
        </section>

        {/* <!-- Interiors --> */}
        <section id="interiors">
            <h2>8. Interiors</h2>
            <h3>Observations</h3>
            <ul>
                <li>Ceilings: <span class="status repair">Repair or Replace</span></li>
                <li>Walls: <span class="status repair">Repair or Replace</span></li>
            </ul>
        </section>

        {/* <!-- Garage --> */}
        <section id="garage">
            <h2>9. Garage</h2>
            <p><strong>Garage Doors:</strong> Automatic</p>
            <h3>Observations</h3>
            <ul>
                <li>Doors: <span class="status repair">Repair or Replace</span></li>
            </ul>
        </section>

        {/* <!-- Kitchen Appliances --> */}
        <section id="appliances">
            <h2>10. Built-In Kitchen Appliances</h2>
            <h3>Observations</h3>
            <ul>
                <li>Dishwasher: <span class="status repair">Repair or Replace</span></li>
            </ul>
        </section>

        {/* <!-- Home Tour --> */}
        <section id="tour">
            <h2>11. Home Tour</h2>
            <p>Includes 360-degree photos and videos of key areas of the property.</p>
        </section>

        {/* <!-- Summary --> */}
        <section id="summary">
            <h2>Summary</h2>
            <ul>
                <li>Roof drainage requires repair.</li>
                <li>Exterior siding and fascia need cleaning and repainting.</li>
                <li>Garage doors peeling; operators require servicing.</li>
            </ul>
        </section>
    </main>

        <footer>
            <p>&copy; Total Home Solutions. All rights reserved.</p>
        </footer>
    </body>
    </>
  );
};

export default HomeInspectionReport;
