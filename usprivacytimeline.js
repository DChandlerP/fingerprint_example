import { initTimeline } from './timeline_core.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- US Specific Data Source ---
    const timelineData = [
        {
            id: 1,
            year: 1928,
            title: 'Olmstead v. United States',
            type: 'case',
            icon: 'gavel',
            shortDesc: 'Supreme Court rules wiretapping is not a "search" if no physical trespass occurs.',
            fullDesc: 'A landmark Prohibition-era case where the Supreme Court held that wiretapping private telephone conversations did not violate the Fourth Amendment unless federal agents physically trespassed on the property. This established the "property-based" approach to privacy.',
            impact: 'Narrowed the Fourth Amendment for nearly 40 years, allowing the government to intercept communications without warrants as long as they didn\'t enter a building.',
            color: 'indigo'
        },
        {
            id: 2,
            year: 1967,
            title: 'Katz v. United States',
            type: 'case',
            icon: 'gavel',
            shortDesc: 'Established the "Reasonable Expectation of Privacy" standard.',
            fullDesc: 'The Supreme Court overruled Olmstead, declaring that the Fourth Amendment protects "people, not places." The ruling involved a listening device on a public phone booth. Justice Harlan\'s concurrence introduced the two-part test for a "reasonable expectation of privacy."',
            impact: 'The foundation of modern US privacy law: The police need a warrant if a person expects privacy and society views that expectation as reasonable.',
            color: 'indigo'
        },
        {
            id: 3,
            year: 1974,
            title: 'Privacy Act of 1974',
            type: 'law',
            icon: 'scale',
            shortDesc: 'Governs collection and use of records by federal agencies.',
            fullDesc: 'Passed post-Watergate, this law prevents federal agencies from disclosing records to other agencies or persons without the written consent of the individual, with some exceptions. It also grants citizens the right to see their own files.',
            impact: 'Established fair information practices for the federal government, though it notably does not apply to the private sector or state governments.',
            color: 'emerald'
        },
        {
            id: 4,
            year: 1978,
            title: 'FISA Enacted',
            type: 'law',
            icon: 'eye',
            shortDesc: 'Foreign Intelligence Surveillance Act sets rules for spying.',
            fullDesc: 'Established the FISC (secret court) to oversee requests for surveillance warrants against foreign spies inside the United States. It was a response to revelations of domestic spying by the CIA and FBI during the Civil Rights era.',
            impact: 'Created a separate legal track for "national security" surveillance, distinct from standard criminal law.',
            color: 'emerald'
        },
        {
            id: 5,
            year: 1979,
            title: 'Smith v. Maryland',
            type: 'case',
            icon: 'phone',
            shortDesc: 'Established the "Third-Party Doctrine."',
            fullDesc: 'The Court ruled that police do not need a warrant to use a pen register (a device that records phone numbers dialed). The reasoning: you voluntarily give that data to the phone company, so you have no expectation of privacy in it.',
            impact: 'A massive blow to privacy. It allows the government to access bank records, phone logs, and ISP metadata without a warrant, arguing you "shared" it with a business.',
            color: 'indigo'
        },
        {
            id: 6,
            year: 1986,
            title: 'ECPA Passed',
            type: 'law',
            icon: 'server',
            shortDesc: 'Electronic Communications Privacy Act.',
            fullDesc: 'Updated wiretap laws for the computer age. It protects email, pager, and cell phone calls. However, it contains the "180-day rule," allowing government access to emails older than 180 days with a mere subpoena rather than a warrant.',
            impact: 'Extended wiretap protections to digital comms, but its outdated provisions are still debated today regarding cloud storage.',
            color: 'emerald'
        },
        {
            id: 7,
            year: 1996,
            title: 'HIPAA',
            type: 'law',
            icon: 'activity',
            shortDesc: 'Health Insurance Portability and Accountability Act.',
            fullDesc: 'The first national standard for the protection of health information. It required the Department of Health and Human Services to establish national standards for electronic health care transactions and national identifiers.',
            impact: 'Defined PHI (Protected Health Information) and strictly limited how doctors and insurers could share medical data.',
            color: 'emerald'
        },
        {
            id: 8,
            year: 1998,
            title: 'COPPA',
            type: 'law',
            icon: 'baby',
            shortDesc: 'Children\'s Online Privacy Protection Act.',
            fullDesc: 'Requires websites to get parental consent before collecting data from children under 13. It dictates what must be included in a privacy policy and when and how to seek verifiable consent from a parent.',
            impact: 'Changed the internet landscape; many platforms (like Facebook/TikTok) restrict users under 13 entirely to avoid compliance costs.',
            color: 'emerald'
        },
        {
            id: 9,
            year: 2001,
            title: 'USA PATRIOT Act',
            type: 'law',
            icon: 'siren',
            shortDesc: 'Sweeping expansion of surveillance post-9/11.',
            fullDesc: 'Passed weeks after 9/11, it broke down the "wall" between intelligence and criminal investigations. Section 215 allowed the FBI to order any person to produce "tangible things" (books, records, papers) relevant to an investigation.',
            impact: 'Used famously by the NSA to justify the bulk collection of millions of American phone records (metadata), later revealed by Edward Snowden.',
            color: 'emerald'
        },
        {
            id: 10,
            year: 2012,
            title: 'United States v. Jones',
            type: 'case',
            icon: 'map-pin',
            shortDesc: 'GPS tracking constitutes a search.',
            fullDesc: 'Police attached a GPS tracker to a suspect\'s Jeep without a valid warrant and tracked him for 28 days. The Court ruled this was a physical trespass onto "effects" protected by the 4th Amendment.',
            impact: 'Signaled the Court was ready to update privacy protections for modern technology, moving back slightly toward the property-based theory.',
            color: 'indigo'
        },
        {
            id: 11,
            year: 2014,
            title: 'Riley v. California',
            type: 'case',
            icon: 'smartphone',
            shortDesc: 'Police need a warrant to search a cell phone incident to arrest.',
            fullDesc: 'Chief Justice Roberts wrote that modern cell phones are not just "containers" but hold the "privacies of life." Therefore, police cannot search the digital contents of a phone simply because they arrested the owner.',
            impact: 'A major victory for digital privacy, recognizing that data on a device requires higher protection than physical objects in a pocket.',
            color: 'indigo'
        },
        {
            id: 12,
            year: 2015,
            title: 'USA FREEDOM Act',
            type: 'law',
            icon: 'shield-alert',
            shortDesc: 'Ended bulk collection of phone metadata.',
            fullDesc: 'Passed in response to the Snowden leaks, this act rolled back parts of the PATRIOT Act. It explicitly banned the bulk collection of Americans\' telephone records and internet metadata by the NSA. Instead, phone companies retain the data, and the NSA must request specific records.',
            impact: 'The first major legislative rollback of surveillance powers in decades, shifting data retention from the government back to private providers.',
            color: 'emerald'
        },
        {
            id: 13,
            year: 2018,
            title: 'Carpenter v. United States',
            type: 'case',
            icon: 'wifi',
            shortDesc: 'Warrant required for historical cell-site location info (CSLI).',
            fullDesc: 'The Court ruled that accessing weeks of historical location records from cell towers constitutes a search. It narrowed the Third-Party Doctrine, stating that just because data is held by a phone company doesn\'t mean the user surrendered all privacy rights.',
            impact: 'A massive check on the Third-Party Doctrine. It suggests that highly revealing digital aggregations (like location history) are protected even if third parties hold them.',
            color: 'indigo'
        },
        {
            id: 14,
            year: 2020,
            title: 'CCPA Enforced',
            type: 'law',
            icon: 'sun',
            shortDesc: 'California Consumer Privacy Act.',
            fullDesc: 'While a state law, the CCPA effectively set a national standard due to California\'s market size. It grants rights to know what data is collected, delete it, and opt-out of its sale. It was followed by the CPRA (Prop 24) which added "sensitive" data categories.',
            impact: 'Forced US companies to add "Do Not Sell My Info" buttons and treat data privacy as a user right, filling the gap left by the lack of a federal privacy law.',
            color: 'emerald'
        }
    ];

    initTimeline(timelineData);
});
