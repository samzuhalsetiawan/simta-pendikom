import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { UNMUL_LOGO_BASE64 } from "@/lib/constants/unmul-logo";

// === TYPES ===
export interface SuratUndanganSeminarData {
    lecturerName: string;
    lecturerNip: string;
    lecturerRole: 'supervisor' | 'examiner';
    studentName: string;
    studentNim: string;
    programStudi: string;
    thesisTitle: string;
    scheduledDate: string;
    venue: string | null;
    seminarType: string;
    allLecturers: { name: string; nip: string; role: string; position: number }[];
}

// === STYLES ===
const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 40,
        paddingHorizontal: 50,
        fontFamily: 'Helvetica',
        fontSize: 11,
        color: '#000',
        lineHeight: 1.5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 8,
        borderBottomWidth: 3,
        borderBottomColor: '#000',
        marginBottom: 20,
    },
    headerLogo: {
        width: 65,
        height: 65,
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
        textAlign: 'center',
    },
    headerLine1: { fontSize: 11, marginBottom: 1 },
    headerLine2: { fontSize: 14, fontWeight: 'bold', marginBottom: 1 },
    headerLine3: { fontSize: 13, fontWeight: 'bold', marginBottom: 1 },
    headerLine4: { fontSize: 9, marginBottom: 0 },
    perihal: {
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 'bold',
        textDecoration: 'underline',
        marginBottom: 20,
    },
    bodyText: {
        fontSize: 11,
        marginBottom: 10,
        textAlign: 'justify',
        lineHeight: 1.6,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    infoLabel: {
        width: 120,
        fontSize: 11,
    },
    infoSeparator: {
        width: 15,
        fontSize: 11,
    },
    infoValue: {
        flex: 1,
        fontSize: 11,
    },
    closingText: {
        fontSize: 11,
        marginBottom: 15,
        marginTop: 10,
        textAlign: 'justify',
        lineHeight: 1.6,
    },
    dateText: {
        fontSize: 11,
        textAlign: 'right',
        marginBottom: 30,
        marginTop: 15,
    },
    signatureSection: {
        alignItems: 'flex-end',
        marginTop: 10,
    },
    signatureLabel: {
        fontSize: 10,
        marginBottom: 3,
    },
    signatureSpace: {
        height: 50,
    },
    signatureName: {
        fontSize: 10,
        fontWeight: 'bold',
        textDecoration: 'underline',
        textAlign: 'center',
    },
    signatureNip: {
        fontSize: 9,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
    },
    lecturerItem: {
        fontSize: 10,
        marginBottom: 2,
        paddingLeft: 15,
    },
});

// === HELPERS ===
function formatDateIndonesian(isoDate: string): string {
    const date = new Date(isoDate);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTime(isoDate: string): string {
    const date = new Date(isoDate);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} WITA`;
}

function formatDateShort(isoDate: string): string {
    const date = new Date(isoDate);
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `Samarinda, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getRoleLabel(role: string): string {
    switch (role) {
        case 'supervisor': return 'Pembimbing';
        case 'examiner': return 'Penguji';
        default: return role;
    }
}

// === MAIN COMPONENT ===
export default function SuratUndanganSeminar({ data }: { data: SuratUndanganSeminarData }) {
    const supervisors = data.allLecturers
        .filter(l => l.role === 'supervisor')
        .sort((a, b) => a.position - b.position);
    const examiners = data.allLecturers
        .filter(l => l.role === 'examiner')
        .sort((a, b) => a.position - b.position);

    return (
        <Document title={`Undangan ${data.seminarType} - ${data.lecturerName}`}>
            <Page size="A4" style={styles.page}>

                {/* ========== HEADER / KOP SURAT ========== */}
                <View style={styles.header}>
                    <Image
                        src={UNMUL_LOGO_BASE64}
                        style={styles.headerLogo}
                    />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerLine1}>
                            KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                        </Text>
                        <Text style={styles.headerLine2}>UNIVERSITAS MULAWARMAN</Text>
                        <Text style={styles.headerLine3}>FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN</Text>
                        <Text style={styles.headerLine4}>
                            Alamat: Jl. Muara Pahu, Kampus Gunung Kelua, Samarinda
                        </Text>
                        <Text style={styles.headerLine4}>
                            Website: http://fkip.unmul.ac.id
                        </Text>
                    </View>
                </View>

                {/* ========== PERIHAL ========== */}
                <Text style={styles.perihal}>UNDANGAN {data.seminarType.toUpperCase()}</Text>

                {/* ========== BODY ========== */}
                <Text style={styles.bodyText}>
                    Kepada Yth.{'\n'}
                    {data.lecturerName}{'\n'}
                    NIP. {data.lecturerNip}{'\n'}
                    Di Tempat
                </Text>

                <Text style={styles.bodyText}>
                    Dengan hormat,
                </Text>

                <Text style={styles.bodyText}>
                    Dengan ini kami mengundang Bapak/Ibu untuk hadir sebagai {getRoleLabel(data.lecturerRole)} pada {data.seminarType} mahasiswa:
                </Text>

                {/* Data Mahasiswa */}
                <View style={{ marginBottom: 5 }}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nama</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{data.studentName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>NIM</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{data.studentNim}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Program Studi</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{data.programStudi}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Judul Skripsi</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{data.thesisTitle}</Text>
                    </View>
                </View>

                {/* Jadwal */}
                <Text style={styles.sectionTitle}>Jadwal Pelaksanaan:</Text>
                <View style={{ marginBottom: 5 }}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Hari/Tanggal</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{formatDateIndonesian(data.scheduledDate)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Waktu</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{formatTime(data.scheduledDate)}</Text>
                    </View>
                    {data.venue && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Tempat</Text>
                            <Text style={styles.infoSeparator}>:</Text>
                            <Text style={styles.infoValue}>{data.venue}</Text>
                        </View>
                    )}
                </View>

                {/* Susunan Tim */}
                <Text style={styles.sectionTitle}>Susunan Tim Penguji dan Pembimbing:</Text>
                {supervisors.map((s, i) => (
                    <Text key={s.nip} style={styles.lecturerItem}>
                        {`${i + 1}. ${s.name} (Pembimbing ${i + 1})`}
                    </Text>
                ))}
                {examiners.map((e, i) => (
                    <Text key={e.nip} style={styles.lecturerItem}>
                        {`${supervisors.length + i + 1}. ${e.name} (Penguji ${i + 1})`}
                    </Text>
                ))}

                {/* Penutup */}
                <Text style={styles.closingText}>
                    Demikian undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.
                </Text>

                {/* Tempat & Tanggal */}
                <Text style={styles.dateText}>{formatDateShort(data.scheduledDate)}</Text>

                {/* Tanda Tangan */}
                <View style={styles.signatureSection}>
                    <Text style={styles.signatureLabel}>Koordinator Program Studi,</Text>
                    <View style={styles.signatureSpace} />
                    <Text style={styles.signatureName}>...............................</Text>
                    <Text style={styles.signatureNip}>NIP. ...............................</Text>
                </View>

            </Page>
        </Document>
    );
}
