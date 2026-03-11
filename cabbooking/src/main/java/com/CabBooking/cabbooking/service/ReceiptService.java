package com.CabBooking.cabbooking.service;

import com.CabBooking.cabbooking.entity.Ride;
import com.CabBooking.cabbooking.repository.RideRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final RideRepository rideRepository;

    // In a real application, you'd wire a JavaMailSender to send this as an
    // attachment.
    // private final JavaMailSender mailSender;

    public byte[] generateReceiptForRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getPayment() == null) {
            throw new RuntimeException("No payment found for this ride");
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("Cab Booking Receipt", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Ride ID: " + ride.getId()));
            document.add(new Paragraph("Rider Name: " + ride.getRider().getName()));
            if (ride.getDriver() != null) {
                document.add(new Paragraph("Driver Name: " + ride.getDriver().getName()));
            }
            document.add(new Paragraph("Pickup: " + ride.getPickupLocation()));
            document.add(new Paragraph("Dropoff: " + ride.getDropoffLocation()));
            document.add(new Paragraph("Distance: " + ride.getDistance() + " km"));
            document.add(new Paragraph("Fare Paid: $" + ride.getPayment().getAmount()));
            document.add(new Paragraph("Status: " + ride.getPayment().getPaymentStatus().name()));

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating receipt", e);
        }
    }
}
