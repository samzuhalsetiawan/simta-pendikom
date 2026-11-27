import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { UNMUL_LOGO_BASE64 } from "@/lib/constants/unmul-logo";

// === TYPES ===
export interface LecturerSignatureData {
    name: string;
    nip: string;
    role: 'supervisor' | 'examiner';
    position: number;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    signatureBuffer?: Buffer | null;
}

export interface SuratPersetujuanSidangSkripsiData {
    studentName: string;
    studentNim: string;
    programStudi: string;
    thesisTitle: string;
    proposedDate: string; // ISO date string
    venue?: string;
    supervisors: LecturerSignatureData[];
    examiners: LecturerSignatureData[];
}

export type SuratPersetujuanPendadaranData = SuratPersetujuanSidangSkripsiData;

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

    // === HEADER (KOP SURAT) ===
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
    headerLine1: {
        fontSize: 11,
        marginBottom: 1,
    },
    headerLine2: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    headerLine3: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    headerLine4: {
        fontSize: 9,
        marginBottom: 0,
    },

    // === BODY ===
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
        width: 110,
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
    statementText: {
        fontSize: 11,
        marginTop: 10,
        marginBottom: 15,
        textAlign: 'justify',
        lineHeight: 1.6,
    },
    scheduleRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    closingText: {
        fontSize: 11,
        marginBottom: 15,
        textAlign: 'justify',
        lineHeight: 1.6,
    },
    dateText: {
        fontSize: 11,
        textAlign: 'right',
        marginBottom: 20,
    },

    // === SIGNATURE SECTION ===
    approvalTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    signatureBox: {
        width: '45%',
        alignItems: 'center',
    },
    signatureBoxThird: {
        width: '30%',
        alignItems: 'center',
    },
    signatureLabel: {
        fontSize: 10,
        marginBottom: 3,
    },
    signatureSpace: {
        height: 50,
    },
    signatureImage: {
        width: 80,
        height: 50,
        objectFit: 'contain',
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
    signatureRowThree: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});

// === HELPER ===
function formatDateIndonesian(isoDate: string): string {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[date.getDay()]} / ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateShort(isoDate: string): string {
    const date = new Date(isoDate);
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `Samarinda, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// === SIGNATURE BLOCK COMPONENT ===
function SignatureBlock({ lecturer, label }: { lecturer: LecturerSignatureData; label: string }) {
    return (
        <>
            <Text style={styles.signatureLabel}>{label}</Text>
            {lecturer.approvalStatus === 'approved' && lecturer.signatureBuffer ? (
                <Image src={{ data: lecturer.signatureBuffer, format: 'png' }} style={styles.signatureImage} />
            ) : (
                <View style={styles.signatureSpace} />
            )}
            <Text style={styles.signatureName}>{lecturer.name}</Text>
            <Text style={styles.signatureNip}>NIP. {lecturer.nip}</Text>
        </>
    );
}

// === MAIN COMPONENT ===
export default function SuratPersetujuanSidangSkripsi({ data }: { data: SuratPersetujuanSidangSkripsiData }) {
    const sortedSupervisors = [...data.supervisors].sort((a, b) => a.position - b.position);
    const sortedExaminers = [...data.examiners].sort((a, b) => a.position - b.position);

    return (
        <Document title={`Surat Persetujuan Sidang Skripsi - ${data.studentName}`}>
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

                {/* ========== BODY ========== */}
                <Text style={styles.bodyText}>
                    Dengan ini kami selaku Tim Pembimbing dan Penguji Tugas Akhir dari Mahasiswa:
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
                </View>

                {/* Pernyataan */}
                <Text style={styles.statementText}>
                    Menyatakan bahwa kami telah memberi persetujuan mahasiswa tersebut untuk dapat
                    melaksanakan Ujian Sidang Skripsi.
                </Text>

                {/* Jadwal */}
                <View style={styles.scheduleRow}>
                    <Text style={styles.infoLabel}>Hari/Tanggal</Text>
                    <Text style={styles.infoSeparator}>:</Text>
                    <Text style={styles.infoValue}>{formatDateIndonesian(data.proposedDate)}</Text>
                </View>
                <View style={styles.scheduleRow}>
                    <Text style={styles.infoLabel}>Tempat</Text>
                    <Text style={styles.infoSeparator}>:</Text>
                    <Text style={styles.infoValue}>{data.venue || '-'}</Text>
                </View>

                {/* Penutup */}
                <Text style={styles.closingText}>
                    Demikian surat ini kami sepakati, agar dapat dipergunakan sebagaimana mestinya.
                </Text>

                {/* Tempat & Tanggal */}
                <Text style={styles.dateText}>{formatDateShort(data.proposedDate)}</Text>

                {/* ========== TANDA TANGAN ========== */}
                <Text style={styles.approvalTitle}>Menyetujui</Text>

                {/* Baris 1: Pembimbing */}
                {sortedSupervisors.length > 0 && (
                    <View style={styles.signatureRow}>
                        {sortedSupervisors.map((sup, idx) => (
                            <View key={sup.nip} style={styles.signatureBox}>
                                <SignatureBlock
                                    lecturer={sup}
                                    label={`Pembimbing ${idx + 1},`}
                                />
                            </View>
                        ))}
                    </View>
                )}

                {/* Baris 2: Penguji */}
                {sortedExaminers.length > 0 && (
                    <View style={styles.signatureRowThree}>
                        {sortedExaminers.map((ex, idx) => (
                            <View key={ex.nip} style={styles.signatureBoxThird}>
                                <SignatureBlock
                                    lecturer={ex}
                                    label={`Penguji ${idx + 1},`}
                                />
                            </View>
                        ))}
                    </View>
                )}

            </Page>
        </Document>
    );
}

export const SuratPersetujuanPendadaran = SuratPersetujuanSidangSkripsi;

